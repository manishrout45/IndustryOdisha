/**
 * Content source helpers.
 *
 * DB_TYPE=mysql  → public site reads WordPress MySQL
 * DB_TYPE=mongodb → public site reads MongoDB
 *
 * When MySQL is connected (mysql/both), admin & author CMS lists can merge both.
 */
const { isMysqlReady } = require('./mysql');

const getDbType = () =>
  String(process.env.DB_TYPE || 'mongodb').trim().toLowerCase();

const isMysqlContentMode = () => getDbType() === 'mysql';

const isMongoContentMode = () => !isMysqlContentMode();

/** Merge Mongo + WP articles for CMS only when DB_TYPE=both. */
const shouldMergeCmsSources = () => {
  if (!isMysqlReady()) return false;
  return getDbType() === 'both';
};

/** Include WordPress users in admin Users/Authors whenever MySQL is up. */
const shouldIncludeWpUsers = () => {
  if (!isMysqlReady()) return false;
  const type = getDbType();
  return type === 'mysql' || type === 'both';
};

module.exports = {
  getDbType,
  isMysqlContentMode,
  isMongoContentMode,
  shouldMergeCmsSources,
  shouldIncludeWpUsers,
};
