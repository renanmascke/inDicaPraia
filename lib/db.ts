import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL || '';

// Parse da DATABASE_URL (formato: mysql://user:pass@host:port/db)
const connectionConfig = () => {
  try {
    const url = new URL(dbUrl);
    // Extraímos os dados sem forçar localhost, respeitando a configuração de nuvem real
    return {
      host: url.hostname || 'localhost',
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.substring(1), // remove initial slash
      port: Number(url.port) || 3306
    };
  } catch (e) {
    console.error('Erro ao parsear DATABASE_URL nos repositórios:', e);
    return null;
  }
};

const pool = connectionConfig() ? mysql.createPool(connectionConfig()!) : null;

export default pool;
