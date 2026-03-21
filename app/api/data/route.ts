import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!pool) {
    return NextResponse.json({ message: 'Erro na configuração do banco.' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const municipio = searchParams.get('municipio');
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    let query = `
      SELECT h.*, m.nome as municipio_nome 
      FROM ima_historico h
      LEFT JOIN municipios m ON h.municipio_db_id = m.id
    `;
    
    const params: any[] = [];
    if (municipio) {
      query += ` WHERE m.nome LIKE ?`;
      params.push(`%${municipio}%`);
    }

    query += ` ORDER BY h.data_coleta DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows]: any = await pool.execute(query, params);

    return NextResponse.json({
      count: rows.length,
      limit,
      offset,
      records: rows.map((r: any) => ({
        ...r,
        municipio: r.municipio_nome,
        dataColeta: r.data_coleta instanceof Date ? r.data_coleta.toISOString().split('T')[0] : r.data_coleta
      }))
    });
  } catch (error: any) {
    console.error('[API Data Nativa] Erro:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar dados no banco.', error: error.message },
      { status: 500 }
    );
  }
}
