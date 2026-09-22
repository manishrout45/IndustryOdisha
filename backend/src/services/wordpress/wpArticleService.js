const ApiError = require('../../utils/ApiError');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { wpTable } = require('../../config/mysql');
const { mapWpPostToArticle } = require('./wpMapper');
const {
  pool,
  getFeaturedImagesMap,
  getAuthorsMap,
  getTermsForPosts,
  getViewCountsMap,
} = require('./wpHelpers');

const PUBLISHED = `p.post_type = 'post' AND p.post_status = 'publish'`;

const hydratePosts = async (rows, flags = {}) => {
  if (!rows?.length) return [];

  const ids = rows.map((r) => Number(r.ID));
  const authorIds = rows.map((r) => Number(r.post_author));

  const [images, authors, categories, tags, views] = await Promise.all([
    getFeaturedImagesMap(ids),
    getAuthorsMap(authorIds),
    getTermsForPosts(ids, 'category'),
    getTermsForPosts(ids, 'post_tag'),
    getViewCountsMap(ids),
  ]);

  return rows.map((row) => {
    const id = Number(row.ID);
    return mapWpPostToArticle(row, {
      featuredImage: images.get(id) || '',
      author: authors.get(Number(row.post_author)),
      categories: categories.get(id) || [],
      tags: tags.get(id) || [],
      viewCount: views.get(id) || Number(row.comment_count) || 0,
      isBreaking: flags.breakingIds?.has(id),
      isTrending: flags.trendingIds?.has(id),
      isFeatured: flags.featuredIds?.has(id),
      isDontMiss: flags.dontMissIds?.has(id),
    });
  });
};

const fetchPostsByIds = async (ids = [], { anyStatus = false } = {}) => {
  const clean = [...new Set(ids.map(Number).filter(Boolean))];
  if (!clean.length) return [];

  const statusSql = anyStatus
    ? `p.post_type = 'post' AND p.post_status <> 'trash'`
    : PUBLISHED;

  const [rows] = await pool().query(
    `SELECT p.*
     FROM ${wpTable('posts')} p
     WHERE p.ID IN (?)
       AND ${statusSql}`,
    [clean]
  );

  // Preserve requested order
  const byId = new Map(rows.map((r) => [Number(r.ID), r]));
  return clean.map((id) => byId.get(id)).filter(Boolean);
};

const listPublished = async ({
  limit = 10,
  offset = 0,
  search = '',
  categoryId = null,
  tagId = null,
  orderBy = 'date',
} = {}) => {
  const where = [`p.post_type = 'post'`, `p.post_status = 'publish'`];
  const params = [];

  let join = '';
  if (categoryId) {
    join += `
      INNER JOIN ${wpTable('term_relationships')} trc
        ON trc.object_id = p.ID
      INNER JOIN ${wpTable('term_taxonomy')} ttc
        ON ttc.term_taxonomy_id = trc.term_taxonomy_id
       AND ttc.taxonomy = 'category'
       AND ttc.term_id = ?
    `;
    params.push(Number(categoryId));
  }

  if (tagId) {
    join += `
      INNER JOIN ${wpTable('term_relationships')} trt
        ON trt.object_id = p.ID
      INNER JOIN ${wpTable('term_taxonomy')} ttt
        ON ttt.term_taxonomy_id = trt.term_taxonomy_id
       AND ttt.taxonomy = 'post_tag'
       AND ttt.term_id = ?
    `;
    params.push(Number(tagId));
  }

  if (search) {
    where.push(
      `(p.post_title LIKE ? OR p.post_excerpt LIKE ? OR p.post_content LIKE ?)`
    );
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  if (orderBy === 'views') {
    join += `
      LEFT JOIN ${wpTable('popularpostsdata')} ppd
        ON ppd.postid = p.ID
    `;
  }

  const whereSql = where.join(' AND ');
  const limitN = Math.max(1, Number(limit) || 10);
  const offsetN = Math.max(0, Number(offset) || 0);
  const orderSql =
    orderBy === 'views'
      ? 'COALESCE(ppd.pageviews, 0) DESC, p.post_date_gmt DESC, p.ID DESC'
      : 'p.post_date_gmt DESC, p.ID DESC';

  const [countRows] = await pool().query(
    `SELECT COUNT(DISTINCT p.ID) AS total
     FROM ${wpTable('posts')} p
     ${join}
     WHERE ${whereSql}`,
    params
  );

  const [rows] = await pool().query(
    `SELECT p.ID, p.post_author, p.post_date, p.post_date_gmt, p.post_content,
            p.post_title, p.post_excerpt, p.post_status, p.post_name,
            p.post_modified, p.post_modified_gmt, p.comment_count
     FROM ${wpTable('posts')} p
     ${join}
     WHERE ${whereSql}
     GROUP BY p.ID, p.post_author, p.post_date, p.post_date_gmt, p.post_content,
              p.post_title, p.post_excerpt, p.post_status, p.post_name,
              p.post_modified, p.post_modified_gmt, p.comment_count
              ${orderBy === 'views' ? ', ppd.pageviews' : ''}
     ORDER BY ${orderSql}
     LIMIT ? OFFSET ?`,
    [...params, limitN, offsetN]
  );

  return {
    rows,
    total: Number(countRows[0]?.total || 0),
  };
};

const getArticles = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const { rows, total } = await listPublished({
    limit,
    offset: skip,
    search: query.search || '',
    categoryId: query.category || null,
    tagId: query.tag || null,
  });

  const articles = await hydratePosts(rows);
  return { articles, meta: buildPaginationMeta(total, page, limit) };
};

const getArticleBySlug = async (slug) => {
  const [rows] = await pool().query(
    `SELECT p.*
     FROM ${wpTable('posts')} p
     WHERE p.post_name = ?
       AND ${PUBLISHED}
     LIMIT 1`,
    [slug]
  );

  if (!rows.length) throw new ApiError(404, 'Article not found');

  const [article] = await hydratePosts(rows);
  return article;
};

const getArticleById = async (id) => {
  const rows = await fetchPostsByIds([id], { anyStatus: true });
  if (!rows.length) throw new ApiError(404, 'Article not found');
  const [article] = await hydratePosts(rows);
  return article;
};

const getLatestNews = async (limit = 10) => {
  const { rows } = await listPublished({ limit, offset: 0 });
  return hydratePosts(rows);
};

const getFeaturedNews = async (limit = 6) => {
  // Top News = most recently published stories
  const { rows } = await listPublished({ limit, offset: 0 });
  const featuredIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { featuredIds });
};

const getBreakingNews = async (limit = 5) => {
  // WordPress has no breaking flag — use the newest published posts
  const { rows } = await listPublished({ limit, offset: 0 });
  const breakingIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { breakingIds });
};

const getTrendingNews = async (limit = 5) => {
  // Prefer view-sorted; fall back to recent
  let rows = [];
  try {
    const result = await listPublished({ limit, offset: 0, orderBy: 'views' });
    rows = result.rows;
  } catch {
    const result = await listPublished({ limit, offset: 0 });
    rows = result.rows;
  }
  const trendingIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { trendingIds });
};

const getDontMissNews = async (limit = 6) => {
  // Next slice after the latest hero batch
  const { rows } = await listPublished({ limit, offset: 6 });
  const dontMissIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { dontMissIds });
};

const getMostReadNews = async (limit = 5) => {
  let rows = [];
  try {
    const result = await listPublished({ limit, offset: 0, orderBy: 'views' });
    rows = result.rows;
  } catch {
    const result = await listPublished({ limit, offset: 0 });
    rows = result.rows;
  }
  return hydratePosts(rows);
};

/**
 * CMS: all non-trash posts (draft / pending / publish) for admin editing.
 */
const listAllForCms = async ({
  search = '',
  authorId = null,
  hardLimit = 2000,
} = {}) => {
  const where = [
    `p.post_type = 'post'`,
    `p.post_status IN ('publish', 'draft', 'pending', 'private', 'future')`,
  ];
  const params = [];

  if (authorId) {
    where.push(`p.post_author = ?`);
    params.push(Number(authorId));
  }

  if (search) {
    where.push(
      `(p.post_title LIKE ? OR p.post_excerpt LIKE ? OR p.post_content LIKE ?)`
    );
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  const whereSql = where.join(' AND ');
  const limitN = Math.min(5000, Math.max(1, Number(hardLimit) || 2000));

  const [rows] = await pool().query(
    `SELECT p.ID, p.post_author, p.post_date, p.post_date_gmt, p.post_content,
            p.post_title, p.post_excerpt, p.post_status, p.post_name,
            p.post_modified, p.post_modified_gmt, p.comment_count
     FROM ${wpTable('posts')} p
     WHERE ${whereSql}
     ORDER BY p.post_date_gmt DESC, p.ID DESC
     LIMIT ?`,
    [...params, limitN]
  );

  return hydratePosts(rows);
};

/**
 * CMS: articles by WordPress author ID (for author dashboard merge).
 */
const getArticlesByAuthor = async (wpAuthorId, query = {}) => {
  return listAllForCms({
    authorId: wpAuthorId,
    search: query.search || '',
    hardLimit: query.limit || 2000,
  });
};

module.exports = {
  getArticles,
  getArticleBySlug,
  getArticleById,
  getLatestNews,
  getFeaturedNews,
  getBreakingNews,
  getTrendingNews,
  getDontMissNews,
  getMostReadNews,
  getArticlesByAuthor,
  listAllForCms,
};
