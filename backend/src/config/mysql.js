const mysql = require('mysql2/promise');

let pool = null;

/**
 * WordPress / staging MySQL connection (migration & read testing).
 * Does not replace Mongoose models — use getMysqlPool() in migration scripts.
 */
const connectMysql = async () => {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = process.env.MYSQL_DATABASE;

  if (!database) {
    throw new Error('MYSQL_DATABASE is not defined in environment variables');
  }

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    namedPlaceholders: true,
    dateStrings: false,
    charset: 'utf8mb4',
  });

  // Verify credentials / DB exist
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT DATABASE() AS db, 1 AS ok');
    const dbName = rows?.[0]?.db || database;
    console.log(`MySQL connected: ${host}:${port}/${dbName}`);
  } finally {
    connection.release();
  }

  return pool;
};

const getMysqlPool = () => {
  if (!pool) {
    throw new Error(
      'MySQL pool is not initialized. Set DB_TYPE=mysql or DB_TYPE=both and restart the server.'
    );
  }
  return pool;
};

const isMysqlReady = () => Boolean(pool);

const getWpTablePrefix = () => process.env.WP_TABLE_PREFIX || 'wp_';

const wpTable = (name) => `\`${getWpTablePrefix()}${name}\``;

const closeMysql = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = {
  connectMysql,
  getMysqlPool,
  isMysqlReady,
  getWpTablePrefix,
  wpTable,
  closeMysql,
};
