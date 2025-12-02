from sqlalchemy import create_engine, Column, String, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Создаем папку для БД если нет
os.makedirs("data", exist_ok=True)

DATABASE_URL = "sqlite:///data/summarizer.db"
Base = declarative_base()

class RequestLog(Base):
    __tablename__ = "request_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True)
    user_id = Column(String, default="anonymous")
    request_type = Column(String)  # 'video' или 'text'
    content_preview = Column(String)  # Первые 100 символов
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")
    # Здесь можно добавить summary_result позже

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Инициализация БД (создание таблиц)"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized")

def save_request_to_db(request_id: str, user_id: str, request_type: str, content_preview: str):
    """Сохранение запроса в БД"""
    db = SessionLocal()
    try:
        request = RequestLog(
            request_id=request_id,
            user_id=user_id,
            request_type=request_type,
            content_preview=content_preview,
            status="completed"
        )
        db.add(request)
        db.commit()
    finally:
        db.close()

def get_recent_requests(limit: int = 10):
    """Получить последние запросы"""
    db = SessionLocal()
    try:
        requests = db.query(RequestLog).order_by(RequestLog.created_at.desc()).limit(limit).all()
        return [
            {
                "request_id": r.request_id,
                "user_id": r.user_id,
                "type": r.request_type,
                "content_preview": r.content_preview,
                "created_at": r.created_at.isoformat()
            }
            for r in requests
        ]
    finally:
        db.close()