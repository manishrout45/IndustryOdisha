const ApiError = require('../../utils/ApiError');
const { generateSlug } = require('../../utils/slugify');
const { wpTable } = require('../../config/mysql');
const { pool } = require('./wpHelpers');

const listCategoryRows = async () => {
  const [rows] = await pool().query(
    `SELECT t.term_id,
            t.name,
            t.slug,
            tt.description,
            tt.parent,
            tt.count,
            tt.term_taxonomy_id
     FROM ${wpTable('term_taxonomy')} tt
     INNER JOIN ${wpTable('terms')} t ON t.term_id = tt.term_id
     WHERE tt.taxonomy = 'category'
     ORDER BY t.name ASC`
  );
  return rows;
};

const toCategory = (row, order = 0) => ({
  _id: String(row.term_id),
  id: String(row.term_id),
  name: row.name,
  slug: row.slug,
  description: row.description || '',
  image: '',
  isActive: true,
  order,
  parent: row.parent && Number(row.parent) !== 0 ? String(row.parent) : null,
  children: [],
  source: 'wordpress-mysql',
});

const buildTree = (categories) => {
  const nodes = new Map(
    categories.map((c) => [String(c._id), { ...c, children: [] }])
  );
  const roots = [];

  nodes.forEach((node) => {
    if (node.parent && nodes.has(String(node.parent))) {
      nodes.get(String(node.parent)).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (list) => {
    list.sort((a, b) => a.name.localeCompare(b.name));
    list.forEach((n) => sortNodes(n.children || []));
  };
  sortNodes(roots);
  return roots;
};

const getCategories = async (activeOnly = true, { tree = true } = {}) => {
  void activeOnly;
  const rows = await listCategoryRows();
  const categories = rows.map((row, i) => toCategory(row, i));
  if (!tree) return categories;
  return buildTree(categories);
};

const getCategoryBySlug = async (slug) => {
  const [rows] = await pool().query(
    `SELECT t.term_id,
            t.name,
            t.slug,
            tt.description,
            tt.parent,
            tt.count
     FROM ${wpTable('term_taxonomy')} tt
     INNER JOIN ${wpTable('terms')} t ON t.term_id = tt.term_id
     WHERE tt.taxonomy = 'category' AND t.slug = ?
     LIMIT 1`,
    [slug]
  );

  if (!rows.length) throw new ApiError(404, 'Category not found');

  const category = toCategory(rows[0]);
  const [childRows] = await pool().query(
    `SELECT t.term_id,
            t.name,
            t.slug,
            tt.description,
            tt.parent,
            tt.count
     FROM ${wpTable('term_taxonomy')} tt
     INNER JOIN ${wpTable('terms')} t ON t.term_id = tt.term_id
     WHERE tt.taxonomy = 'category' AND tt.parent = ?
     ORDER BY t.name ASC`,
    [Number(rows[0].term_id)]
  );

  category.children = childRows.map((r, i) => toCategory(r, i));
  return category;
};

const uniqueTermSlug = async (base, excludeTermId = null) => {
  let slug = generateSlug(base || 'category') || `category-${Date.now()}`;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const params = [candidate];
    let sql = `SELECT term_id FROM ${wpTable('terms')} WHERE slug = ?`;
    if (excludeTermId) {
      sql += ' AND term_id <> ?';
      params.push(Number(excludeTermId));
    }
    sql += ' LIMIT 1';
    const [rows] = await pool().query(sql, params);
    if (!rows.length) return candidate;
    i += 1;
    if (i > 50) return `${slug}-${Date.now()}`;
  }
};

const createCategory = async (data) => {
  const name = String(data.name || '').trim();
  if (!name) throw new ApiError(400, 'Category name is required');

  const slug = await uniqueTermSlug(data.slug || name);
  const parent = data.parent
    ? Number(String(data.parent).replace(/^wp-/i, ''))
    : 0;
  const description = String(data.description || '');

  const [termResult] = await pool().query(
    `INSERT INTO ${wpTable('terms')} (name, slug, term_group) VALUES (?, ?, 0)`,
    [name, slug]
  );
  const termId = Number(termResult.insertId);

  await pool().query(
    `INSERT INTO ${wpTable('term_taxonomy')}
      (term_id, taxonomy, description, parent, count)
     VALUES (?, 'category', ?, ?, 0)`,
    [termId, description, parent || 0]
  );

  return toCategory({
    term_id: termId,
    name,
    slug,
    description,
    parent: parent || 0,
    count: 0,
  });
};

const updateCategory = async (id, data) => {
  const termId = Number(String(id).replace(/^wp-/i, ''));
  if (!termId) throw new ApiError(400, 'Invalid category id');

  const [existing] = await pool().query(
    `SELECT t.term_id, t.name, t.slug, tt.description, tt.parent, tt.count
     FROM ${wpTable('terms')} t
     INNER JOIN ${wpTable('term_taxonomy')} tt ON tt.term_id = t.term_id
     WHERE t.term_id = ? AND tt.taxonomy = 'category'
     LIMIT 1`,
    [termId]
  );
  if (!existing.length) throw new ApiError(404, 'Category not found');

  const name =
    data.name !== undefined ? String(data.name).trim() : existing[0].name;
  const slug =
    data.slug !== undefined || data.name !== undefined
      ? await uniqueTermSlug(data.slug || name, termId)
      : existing[0].slug;

  const description =
    data.description !== undefined
      ? String(data.description)
      : existing[0].description || '';
  const parent =
    data.parent !== undefined
      ? data.parent
        ? Number(String(data.parent).replace(/^wp-/i, ''))
        : 0
      : Number(existing[0].parent || 0);

  await pool().query(
    `UPDATE ${wpTable('terms')} SET name = ?, slug = ? WHERE term_id = ?`,
    [name, slug, termId]
  );
  await pool().query(
    `UPDATE ${wpTable('term_taxonomy')}
     SET description = ?, parent = ?
     WHERE term_id = ? AND taxonomy = 'category'`,
    [description, parent || 0, termId]
  );

  return toCategory({
    term_id: termId,
    name,
    slug,
    description,
    parent: parent || 0,
    count: existing[0].count,
  });
};

const deleteCategory = async (id) => {
  const termId = Number(String(id).replace(/^wp-/i, ''));
  if (!termId) throw new ApiError(400, 'Invalid category id');

  const [existing] = await pool().query(
    `SELECT tt.term_taxonomy_id
     FROM ${wpTable('term_taxonomy')} tt
     WHERE tt.term_id = ? AND tt.taxonomy = 'category'
     LIMIT 1`,
    [termId]
  );
  if (!existing.length) throw new ApiError(404, 'Category not found');

  const ttId = existing[0].term_taxonomy_id;

  await pool().query(
    `UPDATE ${wpTable('term_taxonomy')} SET parent = 0
     WHERE taxonomy = 'category' AND parent = ?`,
    [termId]
  );

  await pool().query(
    `DELETE FROM ${wpTable('term_relationships')} WHERE term_taxonomy_id = ?`,
    [ttId]
  );
  await pool().query(
    `DELETE FROM ${wpTable('term_taxonomy')} WHERE term_taxonomy_id = ?`,
    [ttId]
  );
  await pool().query(`DELETE FROM ${wpTable('terms')} WHERE term_id = ?`, [
    termId,
  ]);

  return { _id: String(termId) };
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
