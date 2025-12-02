import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Временные данные
  const mockData = {
    id,
    title: `Статья #${id}`,
    content: "Полный оригинальный текст статьи...",
    summary: "Краткое содержание статьи...",
    created_at: new Date().toISOString(),
    length: 250
  };

  return NextResponse.json({ 
    success: true, 
    data: mockData 
  });
}