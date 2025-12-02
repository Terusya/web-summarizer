import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    const updatedData = {
      id,
      ...body,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      data: updatedData,
      message: `Запись ${id} обновлена`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка обновления" },
      { status: 500 }
    );
  }
}