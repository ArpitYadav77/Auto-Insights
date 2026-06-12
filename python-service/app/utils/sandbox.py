"""
Code-execution sandbox: AST-based validation and output sanitization.
"""

import ast
import re
from typing import Tuple, List


# ---------------------------------------------------------------------------
# Blocklists
# ---------------------------------------------------------------------------

BLOCKED_IMPORTS: List[str] = [
    "os",
    "sys",
    "subprocess",
    "shutil",
    "socket",
    "http",
    "urllib",
    "requests",
    "pathlib",
    "ctypes",
    "signal",
    "multiprocessing",
    "threading",
    "importlib",
    "pickle",
    "shelve",
    "webbrowser",
    "code",
    "codeop",
    "compileall",
    "ftplib",
    "smtplib",
    "telnetlib",
    "xmlrpc",
]

BLOCKED_BUILTINS: List[str] = [
    "exec",
    "eval",
    "__import__",
    "compile",
    "open",
    "input",
    "breakpoint",
    "globals",
    "locals",
    "vars",
    "dir",
    "getattr",
    "setattr",
    "delattr",
]

# Quick regex-based pre-filter for common dangerous patterns
_DANGEROUS_PATTERNS = [
    r"\bos\s*\.\s*system\b",
    r"\bos\s*\.\s*popen\b",
    r"\bsubprocess\b",
    r"\bshutil\b",
    r"\b__import__\b",
    r"\beval\s*\(",
    r"\bexec\s*\(",
    r"\bopen\s*\(",
    r"\bcompile\s*\(",
    r"\bbreakpoint\s*\(",
]


# ---------------------------------------------------------------------------
# AST-based validation
# ---------------------------------------------------------------------------

def validate_code(code: str) -> Tuple[bool, str]:
    """
    Statically analyse *code* and reject it if it contains dangerous constructs.

    Returns:
        (is_safe, error_message) — *error_message* is empty when safe.
    """
    if not code or not code.strip():
        return False, "No code provided."

    # ---- Step 1: quick regex pre-check ----
    for pattern in _DANGEROUS_PATTERNS:
        match = re.search(pattern, code)
        if match:
            return False, f"Blocked pattern detected: '{match.group()}'"

    # ---- Step 2: parse into AST ----
    try:
        tree = ast.parse(code, mode="exec")
    except SyntaxError as exc:
        return False, f"Syntax error in code: {exc}"

    # ---- Step 3: walk the AST ----
    for node in ast.walk(tree):
        # --- import statements ---
        if isinstance(node, ast.Import):
            for alias in node.names:
                top_module = alias.name.split(".")[0]
                if top_module in BLOCKED_IMPORTS:
                    return False, f"Import of '{alias.name}' is not allowed."

        elif isinstance(node, ast.ImportFrom):
            if node.module:
                top_module = node.module.split(".")[0]
                if top_module in BLOCKED_IMPORTS:
                    return False, f"Import from '{node.module}' is not allowed."

        # --- function calls ---
        elif isinstance(node, ast.Call):
            func = node.func

            # Direct call: e.g.  exec(...)
            if isinstance(func, ast.Name) and func.id in BLOCKED_BUILTINS:
                return False, f"Call to '{func.id}()' is not allowed."

            # Attribute call: e.g.  os.system(...)
            if isinstance(func, ast.Attribute):
                if isinstance(func.value, ast.Name):
                    if func.value.id in BLOCKED_IMPORTS:
                        return False, (
                            f"Call to '{func.value.id}.{func.attr}()' is not allowed."
                        )

        # --- attribute access on blocked modules (even without call) ---
        elif isinstance(node, ast.Attribute):
            if isinstance(node.value, ast.Name) and node.value.id in BLOCKED_IMPORTS:
                return False, (
                    f"Access to '{node.value.id}.{node.attr}' is not allowed."
                )

    return True, ""


# ---------------------------------------------------------------------------
# Output sanitization
# ---------------------------------------------------------------------------

_MAX_OUTPUT_LENGTH = 10_000

# Patterns that look like absolute file-system paths
_PATH_PATTERNS = [
    re.compile(r"[A-Za-z]:\\[^\s\"']+"),          # Windows paths
    re.compile(r"/(?:home|tmp|var|usr|etc)/[^\s\"']+"),  # Unix paths
]


def sanitize_output(output: str) -> str:
    """
    Clean and truncate raw execution output.

    * Truncates to 10 000 characters.
    * Replaces file-system paths with ``<path>``.
    """
    if not output:
        return ""

    text = output

    # Strip absolute paths
    for pat in _PATH_PATTERNS:
        text = pat.sub("<path>", text)

    # Truncate
    if len(text) > _MAX_OUTPUT_LENGTH:
        text = text[: _MAX_OUTPUT_LENGTH] + "\n... [output truncated]"

    return text
