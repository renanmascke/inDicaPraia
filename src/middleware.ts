import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protege apenas rotas de API
  if (request.nextUrl.pathname.startsWith('/api')) {
    const apiKey = request.headers.get('x-api-key');

    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { message: 'Não autorizado. Chave de API inválida ou ausente.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
