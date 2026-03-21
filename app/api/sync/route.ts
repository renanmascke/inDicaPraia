import { NextResponse } from 'next/server';
import { ImaScraperService } from '@/services/ima.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { year } = await request.json();

    if (!year || isNaN(year)) {
      return NextResponse.json(
        { message: 'O parâmetro "year" é obrigatório e deve ser um número.' },
        { status: 400 }
      );
    }

    const scraper = new ImaScraperService();
    const result = await scraper.syncYear(Number(year));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Sync] Erro:', error);
    return NextResponse.json(
      { message: 'Erro interno ao sincronizar dados.', error: error.message },
      { status: 500 }
    );
  }
}
