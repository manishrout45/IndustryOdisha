const { ROLES } = require('../../config/constants');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { isMysqlReady, getMysqlPool, wpTable } = require('../../config/mysql');
const wpArticleService = require('./wpArticleService');

const toPlain = (doc) => {
  if (!doc) return doc;
  if (typeof doc.toObject === 'function') return doc.toObject();
  return { ...doc };
};

const articleDate = (a) =>
  new Date(a.publishedAt || a.createdAt || a.updatedAt || 0).getTime();

/**
 * Map a Mongo CMS user to a WordPress user ID (email / login / display name).
 */
const findWpUserIdForCmsUser = async (user) => {
  if (!user || !isMysqlReady()) return null;

  const email = String(user.email || '').trim();
  const name = String(user.name || '').trim();
  if (!email && !name) return null;

  const pool = getMysqlPool();
  const clauses = [];
  const params = [];

  if (email) {
    clauses.push('user_email = ? OR user_login = ?');
    params.push(email, email);
  }
  if (name) {
    clauses.push('display_name = ? OR user_login = ?');
    params.push(name, name);
  }

  const [rows] = await pool.query(
    `SELECT ID FROM ${wpTable('users')}
     WHERE ${clauses.join(' OR ')}
     LIMIT 1`,
    params
  );

  return rows[0]?.ID ? Number(rows[0].ID) : null;
};

const dedupeBySlug = (articles = []) => {
  const seen = new Set();
  const out = [];
  for (const raw of articles) {
    const a = toPlain(raw);
    const key = String(a.slug || a._id || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
};

/**
 * Fetch WP articles for CMS merge (optionally scoped to a WP author id).
 */
const fetchWpArticlesForCms = async (query = {}, wpAuthorId = null) => {
  if (!isMysqlReady()) return [];

  const search = query.search || '';
  const hardLimit = Math.min(
    5000,
    Math.max(100, parseInt(query.mergeLimit, 10) || 2000)
  );

  if (wpAuthorId) {
    return wpArticleService.listAllForCms({
      authorId: wpAuthorId,
      search,
      hardLimit,
    });
  }

  return wpArticleService.listAllForCms({ search, hardLimit });
};

/**
 * Merge Mongo + WordPress articles for admin/author dashboards.
 * Authors only see Mongo posts they own + WP posts matched to their WP user.
 */
const getMergedArticles = async (mongoFetch, query = {}, user = null) => {
  const { page, limit } = getPagination(query);

  const isAuthor = user?.role === ROLES.AUTHOR && !query.all;
  let wpAuthorId = null;

  if (isAuthor) {
    wpAuthorId = await findWpUserIdForCmsUser(user);
  } else if (query.author) {
    // Admin viewing a specific author's posts (Mongo id or wp-{id})
    const authorParam = String(query.author);
    if (authorParam.startsWith('wp-')) {
      wpAuthorId = Number(authorParam.replace(/^wp-/i, '')) || null;
    } else {
      try {
        const User = require('../../models/user/User');
        const target = await User.findById(query.author).select(
          'name email role'
        );
        if (target) wpAuthorId = await findWpUserIdForCmsUser(target);
      } catch {
        wpAuthorId = null;
      }
    }
  }

  const mongoPromise = mongoFetch();
  const wpPromise =
    (isAuthor || query.author) && !wpAuthorId
      ? Promise.resolve([])
      : fetchWpArticlesForCms(
          query,
          isAuthor || query.author ? wpAuthorId : null
        );

  const [mongoResult, wpArticles] = await Promise.all([mongoPromise, wpPromise]);

  const mongoArticles = (mongoResult.articles || []).map((a) => {
    const plain = toPlain(a);
    return { ...plain, source: plain.source || 'mongodb' };
  });

  const wpTagged = (wpArticles || []).map((a) => ({
    ...toPlain(a),
    source: 'wordpress-mysql',
    readOnly: true,
  }));

  // Prefer Mongo copy when slug collides (editable CMS wins)
  const merged = dedupeBySlug([...mongoArticles, ...wpTagged]).sort(
    (a, b) => articleDate(b) - articleDate(a)
  );

  // Optional date filter (admin UI)
  let filtered = merged;
  if (query.date) {
    const start = new Date(query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(query.date);
    end.setHours(23, 59, 59, 999);
    filtered = merged.filter((a) => {
      const t = articleDate(a);
      return t >= start.getTime() && t <= end.getTime();
    });
  }

  if (query.status && query.status !== 'all') {
    filtered = filtered.filter((a) => a.status === query.status);
  }

  const total = filtered.length;
  const startIdx = (page - 1) * limit;
  const articles = filtered.slice(startIdx, startIdx + limit);

  return {
    articles,
    meta: {
      ...buildPaginationMeta(total, page, limit),
      sources: {
        mongodb: mongoArticles.length,
        wordpress: wpTagged.length,
        merged: total,
      },
    },
  };
};

module.exports = {
  findWpUserIdForCmsUser,
  getMergedArticles,
  toPlain,
};
