import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, url, options } = body;

    if (!text && !url) {
      return NextResponse.json(
        { success: false, error: "Требуется текст или URL" },
        { status: 400 }
      );
    }

    // Имитация суммаризации
    const mockSummary = text 
      ? text.substring(0, 100) + "... [сжато]" 
      : `Содержание с ${url}...`;

    const result = {
      id: Date.now(),
      original: text || url,
      summary: mockSummary,
      length: mockSummary.length,
      created_at: new Date().toISOString(),
      options: options || {}
    };

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: "Суммаризация выполнена"
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}