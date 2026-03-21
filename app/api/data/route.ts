import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Site Restaurado! (Modo de Manutenção)',
    database: 'Desconectado para estabilização',
    timestamp: new Date().toISOString()
  });
}
