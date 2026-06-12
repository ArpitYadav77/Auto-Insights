"""
Sandboxed Python code execution service.

Executes user-provided (AI-generated) Python code in a subprocess with
a strict timeout.  The code operates on a pre-loaded DataFrame called ``df``.
"""

import json
import os
import subprocess
import sys
import tempfile
import textwrap
import uuid
from pathlib import Path
from typing import Any, Dict

from app.utils.sandbox import validate_code, sanitize_output
from app.utils.helpers import read_dataframe

_EXECUTION_TIMEOUT = int(os.getenv("EXECUTION_TIMEOUT", "30"))


def _build_runner_script(user_code: str, data_file: str) -> str:
    """
    Build a self-contained Python script that:
    1. Reads the dataset into ``df``.
    2. Executes the user's code.
    3. Prints a JSON payload with ``__result__``, ``__tables__``, etc.
    """
    ext = Path(data_file).suffix.lower()
    if ext == ".csv":
        read_line = f'df = pd.read_csv(r"{data_file}", encoding="utf-8", encoding_errors="replace")'
    else:
        read_line = f'df = pd.read_excel(r"{data_file}", engine="openpyxl")'

    script = textwrap.dedent(f"""\
        import json, io, sys
        import pandas as pd
        import numpy as np

        # Capture stdout
        _captured = io.StringIO()
        sys.stdout = _captured

        # Load data
        {read_line}

        # ---------- user code ----------
        {textwrap.indent(user_code, "        ").strip()}
        # ---------- end user code ------

        sys.stdout = sys.__stdout__

        _output = _captured.getvalue()

        # Try to collect any DataFrames the user may have created
        _tables = []
        _local_vars = dict(locals())
        for _name, _val in _local_vars.items():
            if isinstance(_val, pd.DataFrame) and _name not in ("df",) and not _name.startswith("_"):
                _tables.append({{
                    "name": _name,
                    "columns": _val.columns.tolist(),
                    "data": _val.head(100).values.tolist(),
                    "shape": list(_val.shape),
                }})

        print(json.dumps({{
            "__result__": "ok",
            "__output__": _output,
            "__tables__": _tables,
        }}, default=str))
    """)
    return script


def execute_code(code: str, file_path: str) -> Dict[str, Any]:
    """
    Safely execute *code* against the dataset at *file_path*.

    Returns::

        {{
            "success": bool,
            "output": str,
            "tables": list,
            "charts": list,
            "error": str | None,
        }}
    """
    # 1. Validate
    is_safe, msg = validate_code(code)
    if not is_safe:
        return {
            "success": False,
            "output": "",
            "tables": [],
            "charts": [],
            "error": f"Code validation failed: {msg}",
        }

    # 2. Ensure the data file exists
    if not Path(file_path).exists():
        return {
            "success": False,
            "output": "",
            "tables": [],
            "charts": [],
            "error": f"Data file not found: {file_path}",
        }

    # 3. Write the runner script to a temp file
    script = _build_runner_script(code, file_path)
    tmp_dir = tempfile.gettempdir()
    script_path = os.path.join(tmp_dir, f"ai_run_{uuid.uuid4().hex[:8]}.py")

    try:
        with open(script_path, "w", encoding="utf-8") as fh:
            fh.write(script)

        # 4. Execute in a subprocess
        proc = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=_EXECUTION_TIMEOUT,
            cwd=tmp_dir,
        )

        stderr_text = sanitize_output(proc.stderr)

        if proc.returncode != 0:
            return {
                "success": False,
                "output": sanitize_output(proc.stdout),
                "tables": [],
                "charts": [],
                "error": stderr_text or "Execution failed with non-zero exit code.",
            }

        # 5. Parse structured output
        stdout_text = proc.stdout.strip()
        lines = stdout_text.split("\n")
        last_line = lines[-1] if lines else ""

        tables: list = []
        output_text = stdout_text

        try:
            payload = json.loads(last_line)
            if isinstance(payload, dict) and "__result__" in payload:
                output_text = sanitize_output(payload.get("__output__", ""))
                tables = payload.get("__tables__", [])
        except (json.JSONDecodeError, TypeError):
            output_text = sanitize_output(stdout_text)

        return {
            "success": True,
            "output": output_text,
            "tables": tables,
            "charts": [],
            "error": stderr_text if stderr_text else None,
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "tables": [],
            "charts": [],
            "error": f"Execution timed out after {_EXECUTION_TIMEOUT} seconds.",
        }
    except Exception as exc:
        return {
            "success": False,
            "output": "",
            "tables": [],
            "charts": [],
            "error": f"Unexpected error: {str(exc)}",
        }
    finally:
        # Cleanup
        try:
            os.unlink(script_path)
        except OSError:
            pass
