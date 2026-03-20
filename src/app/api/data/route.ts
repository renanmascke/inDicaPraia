import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/data
 * Query: ?municipio=Penha&limit=10&offset=0
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const municipio = searchParams.get('municipio');
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    const where: any = {};
    if (municipio) {
      where.municipio = {
        nome: {
          contains: municipio,
        },
      };
    }

    const data = await prisma.imaHistorico.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { dataColeta: 'desc' },
      include: {
        municipio: {
          select: { nome: true }
        }
      }
    });

    return NextResponse.json({
      count: data.length,
      limit,
      offset,
      records: data.map(r => ({
        ...r,
        municipio: r.municipio?.nome,
        // Formatando data para legibilidade no JSON
        dataColeta: r.dataColeta.toISOString().split('T')[0]
      }))
    });
  } catch (error: any) {
    console.error('[API Data] Erro:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar dados.', error: error.message },
      { status: 500 }
    );
  }
}
