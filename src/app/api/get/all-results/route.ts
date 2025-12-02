import { NextResponse } from 'next/server';

export async function GET() {
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
    timestamp: new Date().toISOString()
  });
}