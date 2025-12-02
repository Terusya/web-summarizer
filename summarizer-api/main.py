from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from pipeline import summarize_video_pipeline, summarize_text_pipeline
from database import save_request_to_db, init_db

app = FastAPI(title="Video Summarizer API", version="1.0.0")

# Инициализация БД при старте
@app.on_event("startup")
async def startup_event():
    init_db()

class VideoRequest(BaseModel):
    url: str
    user_id: Optional[str] = "anonymous"

class TextRequest(BaseModel):
    text: str
    user_id: Optional[str] = "anonymous"

@app.get("/")
async def root():
    return {"message": "Video Summarizer API", "status": "running"}

@app.post("/api/summarize/video")
async def summarize_video(request: VideoRequest):
    """Эндпоинт для суммаризации видео по URL"""
    try:
        # Генерируем ID запроса
        request_id = str(uuid.uuid4())
        
        # Сохраняем запрос в БД
        save_request_to_db(
            request_id=request_id,
            user_id=request.user_id,
            request_type="video",
            content_preview=request.url[:100]  # Первые 100 символов URL
        )
        
        # Запускаем пайплайн
        result = summarize_video_pipeline(request.url)
        
        # Возвращаем результат
        return {
            "request_id": request_id,
            "status": "success",
            "summary": result["summary"],
            "original_length": result["original_length"],
            "summary_length": result["summary_length"],
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize/text")
async def summarize_text(request: TextRequest):
    """Эндпоинт для суммаризации текста"""
    try:
        request_id = str(uuid.uuid4())
        
        save_request_to_db(
            request_id=request_id,
            user_id=request.user_id,
            request_type="text",
            content_preview=request.text[:100]
        )
        
        result = summarize_text_pipeline(request.text)
        
        return {
            "request_id": request_id,
            "status": "success",
            "summary": result["summary"],
            "original_length": result["original_length"],
            "summary_length": result["summary_length"],
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/requests")
async def get_requests(limit: int = 10):
    """Получить историю запросов"""
    from database import get_recent_requests
    return get_recent_requests(limit)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)