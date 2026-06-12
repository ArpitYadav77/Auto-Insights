"""
Code execution route — accepts Python code + dataset path and executes
the code in a sandboxed subprocess.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.executor import execute_code

router = APIRouter(prefix="/api", tags=["execute"])


class ExecuteRequest(BaseModel):
    code: str
    filePath: str


@router.post("/execute")
async def execute(body: ExecuteRequest):
    """
    Execute AI-generated Python code against a dataset.

    The code runs in an isolated subprocess with a strict timeout.
    Dangerous imports/builtins are blocked by static analysis before
    execution.
    """
    if not body.code or not body.code.strip():
        raise HTTPException(status_code=400, detail="No code provided.")

    if not body.filePath or not body.filePath.strip():
        raise HTTPException(status_code=400, detail="No file path provided.")

    try:
        result = execute_code(code=body.code, file_path=body.filePath)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Code execution failed: {str(exc)}",
        )
