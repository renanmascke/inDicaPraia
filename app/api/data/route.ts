import { NextResponse } from 'next/server';
import { BathingRepository } from '@/repositories/BathingRepository';

export const dynamic = 'force-dynamic';

/**
 * @openapi
 * /api/data:
 *   get:
 *     summary: Retorna dados históricos de balneabilidade
 *     description: Retorna uma lista de registros de coleta do IMA com filtros opcionais.
 *     parameters:
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Nome do município para filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Limite de registros
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Deslocamento para paginação
 *     responses:
 *       200:
 *         description: Lista de registros retornada com sucesso
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const municipio = searchParams.get('municipio') || '';
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    const repo = new BathingRepository();
    const records = await repo.findRecords(municipio, limit, offset);

    return NextResponse.json({
      status: 'success',
      count: records.length,
      limit,
      offset,
      records
    });
  } catch (error: any) {
    console.error('[API Data Nativa] Erro:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar dados no banco.', error: error.message },
      { status: 500 }
    );
  }
}

