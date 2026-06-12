"""
Profiling route — accepts a file path or file upload and returns
a comprehensive statistical profile of the dataset.
"""

import os
import tempfile
import uuid
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.profiler import profile_dataset
from app.utils.helpers import read_dataframe

router = APIRouter(prefix="/api", tags=["profiling"])


class ProfileRequest(BaseModel):
    filePath: str


@router.post("/profile")
async def profile_by_path(body: ProfileRequest):
    """Profile a dataset given its file-system path."""
    try:
        df = read_dataframe(body.filePath)
        result = profile_dataset(df)
        return {"success": True, "profile": result}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Profiling failed: {str(exc)}")


@router.post("/profile/upload")
async def profile_by_upload(file: UploadFile = File(...)):
    """Profile a dataset uploaded directly to this endpoint."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".csv", ".xlsx", ".xls"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only .csv and .xlsx are supported.",
        )

    tmp_path = os.path.join(
        tempfile.gettempdir(), f"profile_{uuid.uuid4().hex[:8]}{ext}"
    )

    try:
        contents = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(contents)

        df = read_dataframe(tmp_path)
        result = profile_dataset(df)
        return {"success": True, "profile": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Profiling failed: {str(exc)}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
