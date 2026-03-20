import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apenas deixa a requisição passar para testar o 503
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
