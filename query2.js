const mysql = require('mysql2/promise');

async function analyze() {
  const connectionUrl = "mysql://u134028961_indicapraia:IndicaPraia2026@srv1074.hstgr.io:3306/u134028961_indicapraia";
  const parsedUrl = new URL(connectionUrl);
  const pool = mysql.createPool({
    host: parsedUrl.hostname,
    port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306,
    user: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.pathname.replace('/', ''),
  });

  try {
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
        )
      `;

      const [res] = await pool.query(`${cte} SELECT DISTINCT condicao, COUNT(*) as count FROM CurrentState GROUP BY condicao`);
      console.log('CONDICOES NO ESTADO ATUAL:', res);
  } catch (e) { console.error(e); } finally { await pool.end(); }
}
analyze();
