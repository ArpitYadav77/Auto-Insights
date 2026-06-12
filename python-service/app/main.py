"""
Auto Insights Python Service - FastAPI Application Entry Point.

Provides data profiling, automated EDA, and sandboxed code execution
for the Auto Insights AI Analytics Platform.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.profiling import router as profiling_router
from app.routes.eda import router as eda_router
from app.routes.execute import router as execute_router

app = FastAPI(
    title="Auto Insights Python Service",
    description="Python microservice for data profiling, EDA generation, and sandboxed code execution.",
    version="1.0.0",
)

# CORS middleware — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profiling_router)
app.include_router(eda_router)
app.include_router(execute_router)


@app.get("/", tags=["health"])
async def root() -> dict:
    """Root health-check endpoint."""
    return {"status": "healthy", "service": "auto-insights-python"}


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """Explicit health-check endpoint."""
    return {"status": "healthy", "service": "auto-insights-python"}
