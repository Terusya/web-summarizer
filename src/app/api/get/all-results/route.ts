import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Пробуем получить реальные данные из FastAPI
    const response = await fetch('http://localhost:8000/api/requests?limit=10');
    
    if (response.ok) {
      const realData = await response.json();
      return NextResponse.json({ 
        success: true, 
        data: realData,
        source: 'fastapi',
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback: мок-данные если FastAPI не доступен
    const mockResults = [
      { 
        id: 1, 
        request_id: 'mock-1',
        title: "Статья о искусственном интеллекте", 
        summary: "ИИ меняет мир...", 
        date: "2024-01-01",
        length: 150,
        status: "completed"
      },
      { 
        id: 2, 
        request_id: 'mock-2',
        title: "Новости технологий", 
        summary: "Новые гаджеты представлены...", 
        date: "2024-01-02",
        length: 200,
        status: "completed"
      },
    ];

    return NextResponse.json({ 
      success: true, 
      data: mockResults,
      source: 'mock',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Самый базовый fallback
    const mockResults = [
      { 
        id: 1, 
        title: "Статья о искусственном интеллекте", 
        summary: "ИИ меняет мир...", 
        date: "2024-01-01",
        length: 150
      },
      { 
        id: 2, 
        title: "Новости технологий", 
        summary: "Новые гаджеты представлены...", 
        date: "2024-01-02",
        length: 200
      },
    ];

    return NextResponse.json({ 
      success: true, 
      data: mockResults,
      source: 'mock-fallback',
      timestamp: new Date().toISOString()
    });
  }
}