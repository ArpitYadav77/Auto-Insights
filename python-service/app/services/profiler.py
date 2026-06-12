"""
Data profiling service — comprehensive statistical analysis using Pandas.
"""

import math
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from scipy import stats as sp_stats

from app.utils.helpers import convert_numpy_types


def _classify_column(series: pd.Series) -> str:
    """Classify a column as numeric, categorical, datetime, boolean, or text."""
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"

    # Attempt datetime parse on object columns
    if series.dtype == object:
        try:
            sample = series.dropna().head(50)
            if len(sample) > 0:
                pd.to_datetime(sample, infer_datetime_format=True)
                return "datetime"
        except (ValueError, TypeError):
            pass

    nunique = series.nunique()
    total = len(series)
    if total > 0 and nunique / total > 0.5 and nunique > 50:
        return "text"
    return "categorical"


def _numeric_stats(series: pd.Series) -> Dict[str, Any]:
    """Compute detailed statistics for a numeric column."""
    clean = series.dropna()
    if clean.empty:
        return {}
    return {
        "mean": clean.mean(),
        "median": clean.median(),
        "std": clean.std(),
        "min": clean.min(),
        "max": clean.max(),
        "q25": clean.quantile(0.25),
        "q75": clean.quantile(0.75),
        "skewness": clean.skew(),
        "kurtosis": clean.kurtosis(),
        "zeros": int((clean == 0).sum()),
        "negatives": int((clean < 0).sum()),
        "sum": clean.sum(),
    }


def _categorical_stats(series: pd.Series, top_n: int = 10) -> Dict[str, Any]:
    """Compute statistics for a categorical column."""
    clean = series.dropna()
    if clean.empty:
        return {}
    value_counts = clean.value_counts().head(top_n)
    total = len(clean)
    top_values = [
        {
            "value": str(val),
            "count": int(cnt),
            "percentage": round(cnt / total * 100, 2),
        }
        for val, cnt in value_counts.items()
    ]
    mode_val = clean.mode()
    return {
        "topValues": top_values,
        "mode": str(mode_val.iloc[0]) if not mode_val.empty else None,
    }


def _datetime_stats(series: pd.Series) -> Dict[str, Any]:
    """Compute statistics for a datetime column."""
    try:
        dt = pd.to_datetime(series, errors="coerce").dropna()
        if dt.empty:
            return {}
        return {
            "min": dt.min().isoformat(),
            "max": dt.max().isoformat(),
            "range_days": (dt.max() - dt.min()).days,
        }
    except Exception:
        return {}


def profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate a comprehensive profile of a pandas DataFrame.

    Returns a dictionary with overview stats, per-column details,
    correlation matrix (numeric only), and sample data.
    """
    row_count = len(df)
    col_count = len(df.columns)
    duplicate_rows = int(df.duplicated().sum())
    missing_cells = int(df.isnull().sum().sum())
    total_cells = row_count * col_count
    missing_pct = round(missing_cells / total_cells * 100, 2) if total_cells > 0 else 0

    mem_usage = df.memory_usage(deep=True).sum()
    avg_row = mem_usage / row_count if row_count > 0 else 0

    overview = {
        "rowCount": row_count,
        "columnCount": col_count,
        "duplicateRows": duplicate_rows,
        "missingCells": missing_cells,
        "missingPercentage": missing_pct,
        "totalMemoryUsage": f"{mem_usage / 1024 / 1024:.2f} MB",
        "averageRowSize": f"{avg_row / 1024:.2f} KB",
    }

    # ---- Per-column profiling ----
    columns_profile: Dict[str, Any] = {}
    for col in df.columns:
        series = df[col]
        col_type = _classify_column(series)
        missing_count = int(series.isnull().sum())
        unique_count = int(series.nunique())

        col_info: Dict[str, Any] = {
            "type": col_type,
            "dtype": str(series.dtype),
            "missingCount": missing_count,
            "missingPercentage": round(missing_count / row_count * 100, 2) if row_count > 0 else 0,
            "uniqueCount": unique_count,
            "uniquePercentage": round(unique_count / row_count * 100, 2) if row_count > 0 else 0,
        }

        if col_type == "numeric":
            col_info.update(_numeric_stats(series))
        elif col_type == "categorical":
            col_info.update(_categorical_stats(series))
        elif col_type == "datetime":
            col_info.update(_datetime_stats(series))
        elif col_type == "boolean":
            true_cnt = int(series.sum())
            col_info["trueCount"] = true_cnt
            col_info["falseCount"] = row_count - missing_count - true_cnt

        columns_profile[str(col)] = col_info

    # ---- Correlation matrix (numeric columns) ----
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    correlations = None
    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr()
        correlations = {
            "columns": numeric_cols,
            "matrix": corr.values.tolist(),
        }

    # ---- Sample data ----
    sample_rows = df.head(5).fillna("").to_dict(orient="records")

    result = {
        "overview": overview,
        "columns": columns_profile,
        "correlations": correlations,
        "sampleData": sample_rows,
    }

    return convert_numpy_types(result)
