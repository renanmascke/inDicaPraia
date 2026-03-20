import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Rota de API está funcionando na Hostinger!',
    mode: 'Diagnostic (Prisma Disabled)',
    data: []
  });
}
