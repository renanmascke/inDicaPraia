import { NextResponse } from 'next/server';
import { SyncImaRecordsUseCase } from '@/use-cases/SyncImaRecordsUseCase';

export const dynamic = 'force-dynamic';

/**
 * @openapi
 * /api/sync:
 *   post:
 *     summary: Sincroniza dados de balneabilidade de um ano específico
 *     description: Inicia o processo de raspagem de dados do site do IMA para o ano fornecido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Ano para sincronização
 *     responses:
 *       200:
 *         description: Sincronização concluída com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(request: Request) {
  try {
    const { year } = await request.json();

    if (!year || isNaN(year)) {
      return NextResponse.json(
        { message: 'O parâmetro "year" é obrigatório e deve ser um número.' },
        { status: 400 }
      );
    }

    const useCase = new SyncImaRecordsUseCase();
    const result = await useCase.execute(Number(year));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Sync] Erro:', error);
    return NextResponse.json(
      { message: 'Erro interno ao sincronizar dados.', error: error.message },
      { status: 500 }
    );
  }
}
