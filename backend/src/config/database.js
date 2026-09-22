const { connectMongo, isMongoReady } = require('./mongo');
const {
  connectMysql,
  isMysqlReady,
  getMysqlPool,
  wpTable,
  getWpTablePrefix,
} = require('./mysql');
const { getDbType, isMysqlContentMode } = require('./dbMode');

/**
 * Unified database bootstrap.
 *
 * DB_TYPE values:
 *   mongodb  — public content from MongoDB (existing app behaviour)
 *   mysql    — public news/categories/tags from WordPress MySQL
 *   both     — connect both; public content still follows DB_TYPE via dbMode
 *              (use mysql for WP content + Mongo for auth)
 *
 * Auth/admin still need MongoDB. When DB_TYPE=mysql and MONGODB_URI is set,
 * Mongo is also connected unless SKIP_MONGODB=true.
 */
const normalizeDbType = (value) => {
  const type = String(value || 'mongodb').trim().toLowerCase();
  if (!['mongodb', 'mysql', 'both'].includes(type)) {
    throw new Error(
      `Invalid DB_TYPE="${value}". Use mongodb, mysql, or both.`
    );
  }
  return type;
};

const connectDB = async () => {
  const dbType = normalizeDbType(process.env.DB_TYPE || getDbType());
  const skipMongo =
    String(process.env.SKIP_MONGODB || '').toLowerCase() === 'true';

  const status = {
    dbType,
    mongo: false,
    mysql: false,
    contentSource: isMysqlContentMode() ? 'mysql' : 'mongodb',
  };

  console.log(
    `Database mode: DB_TYPE=${dbType} (content=${status.contentSource})`
  );

  const needMysql = dbType === 'mysql' || dbType === 'both';

  // Always connect Mongo when URI exists (auth/CMS), unless explicitly skipped
  const needMongo =
    !skipMongo &&
    Boolean(process.env.MONGODB_URI) &&
    (dbType === 'mongodb' ||
      dbType === 'both' ||
      dbType === 'mysql');

  if (dbType === 'mysql') {
    console.log(
      'Public news APIs read WordPress MySQL. Auth/admin still use MongoDB when connected.'
    );
  }

  if (needMongo) {
    try {
      await connectMongo();
      status.mongo = true;
    } catch (err) {
      if (dbType === 'mongodb') throw err;
      console.warn(
        `MongoDB unavailable (${err.message}). Public MySQL content still works; login/admin will fail until Mongo is reachable.`
      );
    }
  } else if (dbType === 'mongodb') {
    throw new Error('MONGODB_URI is required when DB_TYPE=mongodb');
  } else if (skipMongo) {
    console.warn('SKIP_MONGODB=true — auth/admin Mongo routes are disabled.');
  }

  if (needMysql) {
    await connectMysql();
    status.mysql = true;
    console.log(`WordPress table prefix: ${getWpTablePrefix()}`);
  }

  if (dbType === 'mysql' && !status.mysql) {
    throw new Error('DB_TYPE=mysql but MySQL connection failed.');
  }

  if (dbType === 'mongodb' && !status.mongo) {
    throw new Error('DB_TYPE=mongodb but MongoDB connection failed.');
  }

  if (!status.mongo && !status.mysql) {
    throw new Error('No database connected. Check DB_TYPE and credentials.');
  }

  return status;
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isMongoReady = isMongoReady;
module.exports.isMysqlReady = isMysqlReady;
module.exports.getMysqlPool = getMysqlPool;
module.exports.wpTable = wpTable;
module.exports.getWpTablePrefix = getWpTablePrefix;
module.exports.normalizeDbType = normalizeDbType;
module.exports.isMysqlContentMode = isMysqlContentMode;
