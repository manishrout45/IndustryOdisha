/**
 * Optional read-only probe for WordPress MySQL (migration testing).
 * Does not change any WordPress or Mongo data.
 *
 * Usage:
 *   node src/scripts/testMysqlConnection.js
 */
require('dotenv').config();

const { connectMysql, getMysqlPool, wpTable, closeMysql, getWpTablePrefix } = require('../config/mysql');

async function main() {
  await connectMysql();
  const pool = getMysqlPool();
  const prefix = getWpTablePrefix();

  const [meta] = await pool.query('SELECT DATABASE() AS db, NOW() AS now');
  const [posts] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM ${wpTable('posts')}
     WHERE post_type = 'post' AND post_status = 'publish'`
  );
  const [tables] = await pool.query(
    `SELECT TABLE_NAME AS name
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME LIKE ?
     ORDER BY TABLE_NAME
     LIMIT 20`,
    [`${prefix}%`]
  );

  console.log('OK — MySQL probe succeeded');
  console.log('  database:', meta[0]?.db);
  console.log('  server time:', meta[0]?.now);
  console.log('  table prefix:', prefix);
  console.log('  published posts:', posts[0]?.total);
  console.log(
    '  sample tables:',
    tables.map((t) => t.name).join(', ')
  );

  await closeMysql();
}

main().catch(async (err) => {
  console.error('MySQL probe failed:', err.message);
  try {
    await closeMysql();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
