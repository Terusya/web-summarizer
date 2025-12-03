import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    
    console.log('Запрос истории к FastAPI:', `${FASTAPI_BASE_URL}/api/requests?limit=${limit}`);
    
    // Проксируем запрос к FastAPI для получения реальной истории
    const response = await fetch(`${FASTAPI_BASE_URL}/api/requests?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Ответ от FastAPI:', response.status);
    
    if (!response.ok) {
      console.error('FastAPI вернул ошибку:', response.status, response.statusText);
      // Возвращаем пустой массив вместо мок-данных
      return NextResponse.json({ 
        success: true, 
        data: [],
        timestamp: new Date().toISOString(),
        note: 'FastAPI недоступен'
      });
    }
    
    const data = await response.json();
    console.log('Получены данные истории:', data.length, 'записей');
    
    return NextResponse.json({ 
      success: true, 
      data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    
    // Возвращаем пустой массив вместо мок-данных
    return NextResponse.json({ 
      success: true, 
      data: [],
      timestamp: new Date().toISOString(),
      note: 'Ошибка при получении истории'
    });
  }
}