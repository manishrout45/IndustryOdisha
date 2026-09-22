const ApiError = require('../../utils/ApiError');
const { wpTable } = require('../../config/mysql');
const { pool } = require('./wpHelpers');

const getTags = async () => {
  const [rows] = await pool().query(
    `SELECT t.term_id, t.name, t.slug, tt.count
     FROM ${wpTable('term_taxonomy')} tt
     INNER JOIN ${wpTable('terms')} t ON t.term_id = tt.term_id
     WHERE tt.taxonomy = 'post_tag'
     ORDER BY t.name ASC
     LIMIT 500`
  );

  return rows.map((row) => ({
    _id: String(row.term_id),
    id: String(row.term_id),
    name: row.name,
    slug: row.slug,
    isActive: true,
    source: 'wordpress-mysql',
  }));
};

const getTagBySlug = async (slug) => {
  const [rows] = await pool().query(
    `SELECT t.term_id, t.name, t.slug, tt.count
     FROM ${wpTable('term_taxonomy')} tt
     INNER JOIN ${wpTable('terms')} t ON t.term_id = tt.term_id
     WHERE tt.taxonomy = 'post_tag' AND t.slug = ?
     LIMIT 1`,
    [slug]
  );

  if (!rows.length) throw new ApiError(404, 'Tag not found');

  return {
    _id: String(rows[0].term_id),
    id: String(rows[0].term_id),
    name: rows[0].name,
    slug: rows[0].slug,
    isActive: true,
    source: 'wordpress-mysql',
  };
};

module.exports = {
  getTags,
  getTagBySlug,
};
