import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  allowExitOnIdle: true
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error de conexión BD:', err.stack);
    } else {
        console.log(' Base de Datos conectada correctamente');
    }
});

export default pool;
