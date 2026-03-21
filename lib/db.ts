import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL || '';

// Parse da DATABASE_URL (formato: mysql://user:pass@host:port/db)
const connectionConfig = () => {
  try {
    const url = new URL(dbUrl);
    // Na Hostinger, localhost é o host preferencial para conexões internas
    return {
      host: 'localhost',
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.substring(1),
      port: 3306
    };
  } catch (e) {
    console.error('Erro ao parsear DATABASE_URL:', e);
    return null;
  }
};

const pool = connectionConfig() ? mysql.createPool(connectionConfig()!) : null;

export default pool;
