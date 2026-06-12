"""
EDA route — accepts a file path or file upload and returns
automated Plotly chart specifications.
"""

import os
import tempfile
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.eda_engine import generate_eda
from app.utils.helpers import read_dataframe

router = APIRouter(prefix="/api", tags=["eda"])


class EDARequest(BaseModel):
    filePath: str


@router.post("/eda")
async def eda_by_path(body: EDARequest):
    """Generate EDA charts for a dataset given its file-system path."""
    try:
        df = read_dataframe(body.filePath)
        result = generate_eda(df)
        return {"success": True, "eda": result}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"EDA generation failed: {str(exc)}")


@router.post("/eda/upload")
async def eda_by_upload(file: UploadFile = File(...)):
    """Generate EDA charts for a directly uploaded dataset."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".csv", ".xlsx", ".xls"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only .csv and .xlsx are supported.",
        )

    tmp_path = os.path.join(
        tempfile.gettempdir(), f"eda_{uuid.uuid4().hex[:8]}{ext}"
    )

    try:
        contents = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(contents)

        df = read_dataframe(tmp_path)
        result = generate_eda(df)
        return {"success": True, "eda": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"EDA generation failed: {str(exc)}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
