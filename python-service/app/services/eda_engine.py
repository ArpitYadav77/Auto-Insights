"""
Automated EDA (Exploratory Data Analysis) engine using Plotly.

Generates histograms, box-plots, correlation heatmaps, category charts,
missing-value charts, and distribution overviews — all returned as
Plotly JSON specs with a dark theme.
"""

import json
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder

from app.utils.helpers import convert_numpy_types

_TEMPLATE = "plotly_dark"
_MAX_NUMERIC_CHARTS = 6
_MAX_CATEGORY_CHARTS = 4
_MAX_TOP_VALUES = 10

_BRAND_COLORS = [
    "#6366f1",  # indigo-500
    "#8b5cf6",  # violet-500
    "#a78bfa",  # violet-400
    "#818cf8",  # indigo-400
    "#c084fc",  # purple-400
    "#7c3aed",  # violet-600
    "#4f46e5",  # indigo-600
    "#10b981",  # emerald-500
    "#f59e0b",  # amber-500
    "#f43f5e",  # rose-500
]


def _fig_to_json(fig: go.Figure) -> Any:
    """Convert a Plotly figure to a JSON-serializable dict."""
    return json.loads(json.dumps(fig.to_plotly_json(), cls=PlotlyJSONEncoder))


def _select_columns(df: pd.DataFrame, kind: str, max_cols: int) -> List[str]:
    """Select up to *max_cols* columns of a given kind."""
    if kind == "numeric":
        cols = df.select_dtypes(include=[np.number]).columns.tolist()
    elif kind == "categorical":
        cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    else:
        cols = []
    return cols[:max_cols]


# ---------------------------------------------------------------------------
# Individual chart generators
# ---------------------------------------------------------------------------

def _histograms(df: pd.DataFrame, cols: List[str]) -> List[Dict]:
    charts = []
    for i, col in enumerate(cols):
        color = _BRAND_COLORS[i % len(_BRAND_COLORS)]
        fig = px.histogram(
            df,
            x=col,
            nbins=30,
            title=f"Distribution of {col}",
            template=_TEMPLATE,
            color_discrete_sequence=[color],
        )
        fig.update_layout(
            bargap=0.05,
            xaxis_title=col,
            yaxis_title="Count",
            font=dict(family="Inter, sans-serif"),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
        )
        charts.append({"column": col, "chart": _fig_to_json(fig)})
    return charts


def _box_plots(df: pd.DataFrame, cols: List[str]) -> List[Dict]:
    charts = []
    for i, col in enumerate(cols):
        color = _BRAND_COLORS[i % len(_BRAND_COLORS)]
        fig = px.box(
            df,
            y=col,
            title=f"Box Plot — {col}",
            template=_TEMPLATE,
            color_discrete_sequence=[color],
        )
        fig.update_layout(
            font=dict(family="Inter, sans-serif"),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
        )
        charts.append({"column": col, "chart": _fig_to_json(fig)})
    return charts


def _correlation_matrix(df: pd.DataFrame, cols: List[str]) -> Optional[Dict]:
    if len(cols) < 2:
        return None
    corr = df[cols].corr()
    fig = go.Figure(
        data=go.Heatmap(
            z=corr.values,
            x=corr.columns.tolist(),
            y=corr.index.tolist(),
            colorscale="Viridis",
            zmin=-1,
            zmax=1,
            text=np.round(corr.values, 2),
            texttemplate="%{text}",
            textfont=dict(size=10),
        )
    )
    fig.update_layout(
        title="Correlation Matrix",
        template=_TEMPLATE,
        font=dict(family="Inter, sans-serif"),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        width=700,
        height=600,
    )
    return _fig_to_json(fig)


def _category_charts(df: pd.DataFrame, cols: List[str]) -> List[Dict]:
    charts = []
    for i, col in enumerate(cols):
        vc = df[col].value_counts().head(_MAX_TOP_VALUES)
        color = _BRAND_COLORS[i % len(_BRAND_COLORS)]
        fig = px.bar(
            x=vc.index.astype(str),
            y=vc.values,
            title=f"Top Values — {col}",
            template=_TEMPLATE,
            color_discrete_sequence=[color],
            labels={"x": col, "y": "Count"},
        )
        fig.update_layout(
            xaxis_title=col,
            yaxis_title="Count",
            font=dict(family="Inter, sans-serif"),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
        )
        charts.append({"column": col, "chart": _fig_to_json(fig)})
    return charts


def _missing_values_chart(df: pd.DataFrame) -> Optional[Dict]:
    missing = df.isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False)
    if missing.empty:
        return None
    fig = px.bar(
        x=missing.index.tolist(),
        y=missing.values.tolist(),
        title="Missing Values per Column",
        template=_TEMPLATE,
        color_discrete_sequence=["#f43f5e"],
        labels={"x": "Column", "y": "Missing Count"},
    )
    fig.update_layout(
        xaxis_title="Column",
        yaxis_title="Missing Count",
        font=dict(family="Inter, sans-serif"),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    return _fig_to_json(fig)


def _distribution_overview(df: pd.DataFrame, cols: List[str]) -> Optional[Dict]:
    if len(cols) < 1:
        return None
    # Use a subset if many columns
    subset = cols[:5]
    fig = go.Figure()
    for i, col in enumerate(subset):
        color = _BRAND_COLORS[i % len(_BRAND_COLORS)]
        fig.add_trace(go.Violin(
            y=df[col].dropna(),
            name=col,
            line_color=color,
            fillcolor=color,
            opacity=0.6,
            meanline_visible=True,
        ))
    fig.update_layout(
        title="Distribution Overview (Violin Plots)",
        template=_TEMPLATE,
        font=dict(family="Inter, sans-serif"),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=True,
    )
    return _fig_to_json(fig)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_eda(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate a complete EDA suite for the given DataFrame.

    Returns a dict with keys: histograms, boxPlots, correlationMatrix,
    categoryCharts, missingValues, distributions.
    """
    numeric_cols = _select_columns(df, "numeric", _MAX_NUMERIC_CHARTS)
    categorical_cols = _select_columns(df, "categorical", _MAX_CATEGORY_CHARTS)

    result = {
        "histograms": _histograms(df, numeric_cols),
        "boxPlots": _box_plots(df, numeric_cols),
        "correlationMatrix": _correlation_matrix(df, numeric_cols),
        "categoryCharts": _category_charts(df, categorical_cols),
        "missingValues": _missing_values_chart(df),
        "distributions": _distribution_overview(df, numeric_cols),
    }

    return convert_numpy_types(result)
