import os
import tempfile
import time
from pathlib import Path
from typing import Dict, Any
import yt_dlp
from moviepy import VideoFileClip
import ffmpeg
from faster_whisper import WhisperModel
from transformers import pipeline
import torch

# Функция для скачивания видео (как в ноутбуке)
def download_video(url: str, out_dir: str = None) -> Path:
    """
    Скачать видео по URL
    
    Args:
        url: URL видео
        out_dir: Папка для сохранения (если None, используется временная папка)
    
    Returns:
        Path: Путь к скачанному видео файлу
    """
    if out_dir is None:
        out_dir = tempfile.gettempdir()
    
    out_dir_p = Path(out_dir)
    out_dir_p.mkdir(parents=True, exist_ok=True)
    
    ydl_opts = {
        'outtmpl': str(out_dir_p / '%(title)s.%(ext)s'),
        'format': 'bestvideo+bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
    
    return Path(filename)

# Функция для извлечения аудио (как в ноутбуке)
def extract_audio_to_wav(video_path: Path, out_wav: str = None, sr: int = 16000) -> Path:
    """
    Извлечь аудио из видео в WAV формат
    
    Args:
        video_path: Путь к видео файлу
        out_wav: Путь для сохранения аудио (если None, используется временный файл)
        sr: Частота дискретизации
    
    Returns:
        Path: Путь к WAV файлу
    """
    video_path = Path(video_path)
    
    if out_wav is None:
        # Создаем временный файл
        temp_dir = tempfile.gettempdir()
        out_wav = Path(temp_dir) / f"{video_path.stem}_audio.wav"
    else:
        out_wav = Path(out_wav)
    
    # Используем moviepy для извлечения аудио
    clip = VideoFileClip(str(video_path))
    tmp_audio = video_path.with_suffix('.temp_audio.wav')
    clip.audio.write_audiofile(str(tmp_audio), fps=sr)
    clip.close()
    
    # Конвертируем в моно с помощью ffmpeg
    stream = ffmpeg.input(str(tmp_audio))
    stream = ffmpeg.output(stream, str(out_wav), ac=1, ar=sr)
    ffmpeg.run(stream, overwrite_output=True, quiet=True)
    
    # Удаляем временный файл
    try:
        os.remove(tmp_audio)
    except Exception:
        pass
    
    return out_wav

# Функция для транскрибации (как в ноутбуке)
def transcribe_audio_wisper(audio_path: Path, model_size: str = 'small', 
                           language: str = 'ru', task: str = 'transcribe') -> str:
    """
    Транскрибировать аудио с помощью Whisper
    
    Args:
        audio_path: Путь к аудио файлу
        model_size: Размер модели Whisper ('tiny', 'base', 'small', 'medium', 'large')
        language: Язык аудио
        task: Тип задачи ('transcribe' или 'translate')
    
    Returns:
        str: Транскрибированный текст
    """
    # Определяем устройство (GPU если доступен)
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    compute_type = 'float16' if device == 'cuda' else 'float32'
    
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    segments, info = model.transcribe(
        str(audio_path), 
        beam_size=5, 
        language=language, 
        task=task
    )
    
    texts = []
    for segment in segments:
        texts.append(segment.text)
    
    full_text = ' '.join(texts)
    return full_text.strip()

# Вспомогательная функция для разбивки текста на чанки (как в ноутбуке)
def chunk_text(text: str, max_chars: int = 3000):
    """
    Разбить текст на чанки указанного максимального размера
    
    Args:
        text: Исходный текст
        max_chars: Максимальное количество символов в чанке
    
    Returns:
        list: Список чанков текста
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunks.append(text[start:end])
        start = end
    return chunks

# Функция для суммаризации текста (как в ноутбуке, с моделью 2KKLabs/Lacia_sum_small_v1)
def summarize_text(text: str, model_name: str = '2KKLabs/Lacia_sum_small_v1', 
                   max_chunk_chars: int = 3000) -> str:
    """
    Суммаризировать текст с помощью указанной модели
    
    Args:
        text: Текст для суммаризации
        model_name: Название модели для суммаризации
        max_chunk_chars: Максимальный размер чанка
    
    Returns:
        str: Суммаризированный текст
    """
    # Определяем устройство
    device = 0 if torch.cuda.is_available() else -1
    
    # Создаем пайплайн суммаризации
    summarizer = pipeline(
        'summarization', 
        model=model_name, 
        device=device,
        truncation=True
    )
    
    # Разбиваем текст на чанки
    chunks = chunk_text(text, max_chars=max_chunk_chars)
    summaries = []
    
    # Суммаризируем каждый чанк
    for i, ch in enumerate(chunks):
        res = summarizer(ch, max_length=200, min_length=30, do_sample=False)
        summaries.append(res[0]['summary_text'])
    
    # Если чанков было несколько, объединяем результаты и суммаризируем еще раз
    if len(summaries) > 1:
        joined = ' '.join(summaries)
        res2 = summarizer(joined, max_length=250, min_length=50, do_sample=False)
        return res2[0]['summary_text']
    else:
        return summaries[0]

# Пайплайн для суммаризации видео
def summarize_video_pipeline(video_url: str) -> Dict[str, Any]:
    """
    Полный пайплайн: скачивание → аудио → транскрибация → суммаризация
    
    Args:
        video_url: URL видео для суммаризации
    
    Returns:
        dict: Результат суммаризации со статистикой
    """
    start_time = time.time()
    
    try:
        # 1. Скачать видео
        #print(f"Скачивание видео: {video_url}")
        video_path = download_video(video_url)
        #print(f"Видео сохранено: {video_path}")
        
        # 2. Извлечь аудио
        #print("Извлечение аудио...")
        audio_path = extract_audio_to_wav(video_path)
        #print(f"Аудио сохранено: {audio_path}")
        
        # 3. Транскрибировать
        #print("Транскрибация аудио...")
        text = transcribe_audio_wisper(audio_path)
        #print(f"Транскрибированный текст ({len(text)} символов): {text[:100]}...")
        
        # 4. Суммаризировать
        #print("Суммаризация текста...")
        summary = summarize_text(text, '2KKLabs/Lacia_sum_small_v1')
        #print(f"Суммаризированный текст ({len(summary)} символов): {summary}")
        
        # Очистка временных файлов
        #print("Очистка временных файлов...")
        for path in [video_path, audio_path]:
            try:
                if path.exists():
                    os.remove(path)
                    #print(f"Удален: {path}")
            except Exception as e:
                print(f"Ошибка при удалении {path}: {e}")
        
        processing_time = time.time() - start_time
        #print(f"Пайплайн завершен за {processing_time:.2f} секунд")
        
        return {
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "processing_time": processing_time,
            "status": "success"
        }
        
    except Exception as e:
        print(f"Ошибка в пайплайне: {e}")
        return {
            "error": str(e),
            "summary": "",
            "original_length": 0,
            "summary_length": 0,
            "processing_time": time.time() - start_time,
            "status": "error"
        }

# Пайплайн для суммаризации текста
def summarize_text_pipeline(text: str) -> Dict[str, Any]:
    """
    Пайплайн для суммаризации готового текста
    
    Args:
        text: Текст для суммаризации
    
    Returns:
        dict: Результат суммаризации со статистикой
    """
    start_time = time.time()
    
    try:
        #print(f"Суммаризация текста ({len(text)} символов)...")
        summary = summarize_text(text, '2KKLabs/Lacia_sum_small_v1')
        #print(f"Суммаризированный текст ({len(summary)} символов): {summary}")
        
        processing_time = time.time() - start_time
        #print(f"Суммаризация завершена за {processing_time:.2f} секунд")
        
        return {
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "processing_time": processing_time,
            "status": "success"
        }
    except Exception as e:
        print(f"Ошибка при суммаризации: {e}")
        return {
            "error": str(e),
            "summary": "",
            "original_length": len(text),
            "summary_length": 0,
            "processing_time": time.time() - start_time,
            "status": "error"
        }