import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Функция для извлечения ID из URL
function extractTaskId(url: string): string | null {
  const match = url.match(/\/api\/summarize\/([^\/]+)\/status/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  try {
    // Извлекаем taskId из URL вручную
    const url = request.url;
    const taskId = extractTaskId(url);
    
    if (!taskId) {
      console.error('Task ID not found in URL:', url);
      return NextResponse.json(
        { 
          request_id: 'unknown',
          status: 'error',
          error: 'Task ID not found in URL'
        },
        { status: 400 }
      );
    }
    
    console.log(`Проверка статуса задачи: ${taskId} (из URL: ${url})`);
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/requests/${taskId}/status`);
    
    if (!response.ok) {
      console.error(`Ошибка FastAPI: ${response.status}`);
      return NextResponse.json(
        { 
          request_id: taskId,
          status: 'error',
          error: 'Задача не найдена'
        },
        { status: 404 }
      );
    }

    const data = await response.json();
    console.log(`Статус задачи ${taskId}: ${data.status}`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json(
      { 
        request_id: 'unknown',
        status: 'error',
        error: 'Внутренняя ошибка сервера'
      },
      { status: 500 }
    );
  }
}