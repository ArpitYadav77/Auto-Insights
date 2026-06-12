"""
Helper utilities for file I/O, type detection, and JSON-safe serialization.
"""

import math
import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


def detect_file_type(file_path: str) -> str:
    """
    Detect whether a file is CSV or XLSX based on its extension.

    Args:
        file_path: Path to the data file.

    Returns:
        'csv' or 'xlsx'.

    Raises:
        ValueError: If the extension is unsupported.
    """
    ext = Path(file_path).suffix.lower()
    if ext == ".csv":
        return "csv"
    if ext in (".xlsx", ".xls"):
        return "xlsx"
    raise ValueError(
        f"Unsupported file extension '{ext}'. Only .csv and .xlsx/.xls files are supported."
    )


def read_dataframe(file_path: str) -> pd.DataFrame:
    """
    Read a CSV or XLSX file into a pandas DataFrame.

    Args:
        file_path: Absolute or relative path to the data file.

    Returns:
        A pandas DataFrame.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the file type is unsupported or the file is empty.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    file_type = detect_file_type(file_path)

    if file_type == "csv":
        df = pd.read_csv(file_path, encoding="utf-8", encoding_errors="replace")
    else:
        df = pd.read_excel(file_path, engine="openpyxl")

    if df.empty and df.columns.size == 0:
        raise ValueError("The file is empty or could not be parsed.")

    return df


def convert_numpy_types(obj: Any) -> Any:
    """
    Recursively convert numpy / pandas types to native Python types
    so that the result is JSON-serializable.

    Handles: np.integer, np.floating, np.bool_, np.ndarray,
             pd.Timestamp, pd.NaT, NaN, Inf, etc.
    """
    if obj is None or obj is pd.NaT:
        return None

    # numpy scalar types
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    if isinstance(obj, (np.bool_,)):
        return bool(obj)
    if isinstance(obj, np.ndarray):
        return [convert_numpy_types(item) for item in obj.tolist()]

    # pandas types
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    if isinstance(obj, pd.Categorical):
        return obj.tolist()

    # plain float edge cases
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj

    # dict / list recursion
    if isinstance(obj, dict):
        return {str(k): convert_numpy_types(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]

    # fallback — attempt to let json handle it
    return obj


def safe_json_serialize(obj: Any) -> str:
    """
    Serialize an object to a JSON string, converting numpy types first.

    Args:
        obj: Any Python/numpy/pandas object.

    Returns:
        A JSON string.
    """
    cleaned = convert_numpy_types(obj)
    return json.dumps(cleaned, default=str, ensure_ascii=False)
