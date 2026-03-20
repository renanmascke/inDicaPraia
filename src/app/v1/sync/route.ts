import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'Rota de sincronização está funcionando (Diagnóstico)!',
    mode: 'Prisma Disabled'
  });
}
