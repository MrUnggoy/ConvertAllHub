from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from routers import pdf, image, audio, video, text, ocr, qr, auth, documents, sitemap
from models.conversion_models import ConversionResponse
from models.user_models import User
from middleware.rate_limit import rate_limit_middleware
from services.progress_tracker import progress_tracker

# Initialize FastAPI app
app = FastAPI(
    title="ConvertAll Hub API",
    description="Universal file conversion API with multiple tool endpoints",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Serve uploaded files (for local storage)
if not os.getenv('STORAGE_TYPE') or os.getenv('STORAGE_TYPE') == 'local':
    upload_dir = os.getenv('UPLOAD_DIR', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF Tools"])
app.include_router(image.router, prefix="/api/image", tags=["Image Tools"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio Tools"])
app.include_router(video.router, prefix="/api/video", tags=["Video Tools"])
app.include_router(text.router, prefix="/api/text", tags=["Text Tools"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR Tools"])
app.include_router(qr.router, prefix="/api/qr", tags=["QR Tools"])
app.include_router(documents.router, prefix="/api/documents", tags=["Document Tools"])
app.include_router(sitemap.router, tags=["SEO"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "ConvertAll Hub API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "convertall-hub-api"}

@app.get("/api/progress/{task_id}")
async def get_task_progress(task_id: str):
    """Get progress status for a specific task"""
    task_status = progress_tracker.get_task_status(task_id)
    
    if not task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "task_id": task_id,
        "status": task_status['status'].value if hasattr(task_status['status'], 'value') else task_status['status'],
        "progress": task_status['progress'],
        "message": task_status['message'],
        "created_at": task_status['created_at'],
        "updated_at": task_status['updated_at'],
        "metadata": task_status.get('metadata', {}),
        "result_url": task_status.get('result_url'),
        "error_message": task_status.get('error_message')
    }

@app.delete("/api/progress/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a running task"""
    success = progress_tracker.cancel_task(task_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or cannot be cancelled")
    
    return {"message": "Task cancelled successfully", "task_id": task_id}

@app.get("/api/progress")
async def get_all_tasks(limit: int = 50):
    """Get all tasks (for monitoring/debugging)"""
    tasks = progress_tracker.get_all_tasks(limit=limit)
    task_counts = progress_tracker.get_task_count_by_status()
    
    return {
        "tasks": {
            task_id: {
                **task_data,
                "status": task_data['status'].value if hasattr(task_data['status'], 'value') else task_data['status']
            }
            for task_id, task_data in tasks.items()
        },
        "summary": task_counts,
        "total_tasks": len(tasks)
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error_message": exc.detail,
            "status_code": exc.status_code
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )