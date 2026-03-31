import pool from '@/lib/db';
import { ImaRecord } from '@/types';

export class BathingRepository {
  /**
   * Salva os registros no banco via SQL nativo (processamento em batch).
   */
  async insertInBatches(records: ImaRecord[], municipioMap: Map<string, number>, year: number): Promise<number> {
    if (!pool || records.length === 0) return 0;

    let insertedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values: any[] = [];

      batch.forEach(r => {
        values.push(
          municipioMap.get(r.municipio)!,
          r.balneario,
          r.ponto_coleta,
          r.localizacao,
          r.data_coleta,
          r.hora,
          r.vento,
          r.mare,
          r.chuva,
          r.agua_temp,
          r.ar_temp,
          r.ecoli,
          r.condicao,
          year
        );
      });

      const sql = `
        INSERT IGNORE INTO ima_historico 
        (municipio_db_id, balneario, ponto_coleta, localizacao, data_coleta, hora, vento, mare, chuva, agua_temp, ar_temp, ecoli, condicao, ano_referencia) 
        VALUES ${placeholders}
      `;

      const [result]: any = await pool.execute(sql, values);
      insertedCount += result.affectedRows;
    }

    return insertedCount;
  }

  /**
   * Conta o total de registros considerando os filtros aplicados para a Paginação.
   */
  async countRecords(municipio: string = '', balneario: string = '', status: string = ''): Promise<number> {
    if (!pool) return 0;
    let query = `
      SELECT COUNT(*) as total 
      FROM ima_historico h
      LEFT JOIN municipios m ON h.municipio_db_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (municipio) { query += ` AND m.nome = ?`; params.push(municipio); }
    if (balneario) { query += ` AND h.balneario = ?`; params.push(balneario); }
    if (status) { 
      if (status === 'propria') {
        query += ` AND h.condicao IN ('PRÓPRIA', 'Propria', 'PRÓPRIO', 'Proprio')`;
      } else if (status === 'impropria') {
        query += ` AND h.condicao IN ('IMPRÓPRIA', 'Impropria', 'IMPRÓPRIO', 'Improprio')`;
      } else {
        query += ` AND h.condicao LIKE ?`; params.push(`%${status}%`);
      }
    }

    const [rows]: any = await pool.execute(query, params);
    return rows[0]?.total || 0;
  }

  /**
   * Busca registros do histórico com base nos filtros múltiplos e paginação.
   */
  async findRecords(municipio: string = '', balneario: string = '', status: string = '', limit: number = 20, offset: number = 0, sort: string = 'data', order: string = 'desc'): Promise<any[]> {
    if (!pool) return [];

    let query = `
      SELECT h.*, m.nome as municipio_nome 
      FROM ima_historico h
      LEFT JOIN municipios m ON h.municipio_db_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (municipio) { query += ` AND m.nome = ?`; params.push(municipio); }
    if (balneario) { query += ` AND h.balneario = ?`; params.push(balneario); }
    if (status) { 
      if (status === 'propria') {
        query += ` AND h.condicao IN ('PRÓPRIA', 'Propria', 'PRÓPRIO', 'Proprio')`;
      } else if (status === 'impropria') {
        query += ` AND h.condicao IN ('IMPRÓPRIA', 'Impropria', 'IMPRÓPRIO', 'Improprio')`;
      } else {
        query += ` AND h.condicao LIKE ?`; params.push(`%${status}%`);
      }
    }

    const orderByMap: Record<string, string> = {
      'status': 'h.condicao',
      'municipio': 'm.nome',
      'balneario': 'h.balneario',
      'data': 'h.data_coleta'
    };
    
    // Fallback de proteção contra SQL Injection na ordem
    const sqlFormatOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    let sqlFormatField = orderByMap[sort] || 'h.data_coleta';

    if (sort === 'balneario') {
      sqlFormatField = `h.ponto_coleta ${sqlFormatOrder}, h.data_coleta`;
    }

    query += ` ORDER BY ${sqlFormatField} ${sort === 'balneario' ? 'DESC' : sqlFormatOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows]: any = await pool.execute(query, params);
    
    // Tratando formatação do repositório para a camada de visualização
    return rows.map((r: any) => ({
      ...r,
      municipio: r.municipio_nome,
      status: r.condicao,
      data_coleta: r.data_coleta instanceof Date ? r.data_coleta.toISOString().split('T')[0] : r.data_coleta
    }));
  }

  /**
   * Coleta métricas otimizadas agregadas para a página inicial (Dashboard BI em Tempo Real).
   * Sistema Drill-Down: Mergulha os agrupamentos de acordo com o escopo solicitado.
   */
  async getDashboardInsights(municipioFiltro: string = '', balnearioFiltro: string = '') {
    const defaultReturn = { total: 0, safe: 0, danger: 0, topSafe: [], topDanger: [], scope: 'Estado' };
    if (!pool) return defaultReturn;

    try {
      let filterCte = '';
      if (municipioFiltro) filterCte += ` AND m.nome = '${municipioFiltro.replace(/'/g, "''")}'`;
      if (balnearioFiltro) filterCte += ` AND lr.balneario = '${balnearioFiltro.replace(/'/g, "''")}'`;

      const cte = `
        WITH LatestRecords AS (
          SELECT municipio_db_id, balneario, ponto_coleta, MAX(data_coleta) as max_data
          FROM ima_historico
          GROUP BY municipio_db_id, balneario, ponto_coleta
        ),
        CurrentState AS (
          SELECT h.*, m.nome as municipio_nome 
          FROM ima_historico h
          JOIN LatestRecords lr ON 
            h.municipio_db_id = lr.municipio_db_id AND
            h.balneario = lr.balneario AND
            h.ponto_coleta = lr.ponto_coleta AND
            h.data_coleta = lr.max_data
          LEFT JOIN municipios m ON h.municipio_db_id = m.id
          WHERE 1=1 ${filterCte}
        )
      `;

      let groupCol = 'municipio_nome';
      let scope = 'Estado';
      let minDocs = 4; // Threshold do estado

      if (balnearioFiltro) {
        groupCol = 'ponto_coleta';
        scope = 'Ponto';
        minDocs = 1; // Ponto não possui array associado agrupado, só ele próprio
      } else if (municipioFiltro) {
        groupCol = 'balneario';
        scope = 'Balneário';
        minDocs = 1; // Tirar threshold de cidade
      }

      const [totalRows]: any = await pool.query(`${cte} SELECT COUNT(*) as total FROM CurrentState`);
      
      const [safeRes]: any = await pool.query(`${cte} 
        SELECT COUNT(*) as count FROM CurrentState 
        WHERE condicao IN ('PRÓPRIA', 'Propria', 'PRÓPRIO', 'Proprio')
      `);
      
      const [topSafeRows]: any = await pool.query(`${cte} 
        SELECT 
          ${groupCol} as label, 
          COUNT(CASE WHEN condicao IN ('PRÓPRIA', 'Propria', 'PRÓPRIO', 'Proprio') THEN 1 END) as count,
          COUNT(*) as total,
          ROUND((COUNT(CASE WHEN condicao IN ('PRÓPRIA', 'Propria', 'PRÓPRIO', 'Proprio') THEN 1 END) / COUNT(*)) * 100) as pct
        FROM CurrentState 
        GROUP BY ${groupCol} 
        HAVING total >= ${minDocs} AND count > 0
        ORDER BY pct DESC, total DESC LIMIT 4
      `);
      
      const [topDangerRows]: any = await pool.query(`${cte} 
        SELECT 
          ${groupCol} as label, 
          COUNT(CASE WHEN condicao IN ('IMPRÓPRIA', 'Impropria', 'IMPRÓPRIO', 'Improprio') THEN 1 END) as count,
          COUNT(*) as total,
          ROUND((COUNT(CASE WHEN condicao IN ('IMPRÓPRIA', 'Impropria', 'IMPRÓPRIO', 'Improprio') THEN 1 END) / COUNT(*)) * 100) as pct
        FROM CurrentState 
        GROUP BY ${groupCol} 
        HAVING total >= ${minDocs} AND count > 0
        ORDER BY pct DESC, total DESC LIMIT 4
      `);

      const total = totalRows[0]?.total || 0;
      const safe = safeRes[0]?.count || 0;
      
      return { 
        scope,
        total, 
        safe, 
        danger: total - safe,
        topSafe: topSafeRows,
        topDanger: topDangerRows 
      };
    } catch(err) {
      console.error(err);
      return defaultReturn;
    }
  }

  /**
   * Busca a árvore exata de Municípios e Balneários para popular os Selects do Frontend na Cascata.
   */
  async getLocationsTree() {
    if (!pool) return {};
    try {
      const [rows]: any = await pool.query(`
        SELECT DISTINCT m.nome as municipio, h.balneario 
        FROM ima_historico h
        JOIN municipios m ON h.municipio_db_id = m.id
        ORDER BY m.nome ASC, h.balneario ASC
      `);
      
      const tree: Record<string, string[]> = {};
      for (const row of rows) {
        if (!tree[row.municipio]) tree[row.municipio] = [];
        if (row.balneario) tree[row.municipio].push(row.balneario);
      }
      return tree;
    } catch(err) {
      console.error(err);
      return {};
    }
  }
}
