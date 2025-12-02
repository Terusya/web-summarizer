import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Имитация удаления
  return NextResponse.json({ 
    success: true, 
    message: `Запись ${id} удалена`,
    deleted_id: id
  });
}