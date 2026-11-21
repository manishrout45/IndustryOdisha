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
  getPostMetaMap,
} = require('./wpHelpers');
const wpCategoryService = require('./wpCategoryService');
const { SEO_META_KEYS, SEO_LOOKUP_KEYS, mapSeoFromMeta } = require('./wpSeo');
const { scoreListSeo } = require('./wpListSeoScore');

const FOCUS_KEYPHRASE_META_KEYS = [
  SEO_META_KEYS.focusKeyphrase,
  '_yoast_wpseo_focuskw',
  'rank_math_focus_keyword',
];

/** Rank title matches: 1st word first, then 2nd, 3rd… Prefix beats mid-word. */
const titleWordRank = (title, query) => {
  const q = String(query || '')
    .toLowerCase()
    .trim();
  if (!q) return Number.MAX_SAFE_INTEGER;
  const words = String(title || '')
    .toLowerCase()
    .split(/[^a-z0-9\u00c0-\u024f]+/i)
    .filter(Boolean);
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].startsWith(q)) return i;
  }
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].includes(q)) return i + 0.5;
  }
  if (String(title || '').toLowerCase().includes(q)) {
    return words.length + 10;
  }
  return Number.MAX_SAFE_INTEGER;
};

const rankRowsByTitle = (rows, search) => {
  const q = String(search || '').trim();
  if (!q || !Array.isArray(rows) || !rows.length) return rows || [];
  return [...rows].sort((a, b) => {
    const rankA = titleWordRank(a.post_title, q);
    const rankB = titleWordRank(b.post_title, q);
    if (rankA !== rankB) return rankA - rankB;
    const dateA = new Date(a.post_date_gmt || a.post_date || 0).getTime();
    const dateB = new Date(b.post_date_gmt || b.post_date || 0).getTime();
    return dateB - dateA;
  });
};

const PUBLISHED = `p.post_type = 'post' AND p.post_status = 'publish'`;
const EXPLAINER_META_KEY = '_io_is_explainer';
const ALSO_READ_META_KEY = '_io_also_read';

const summarizeAlsoRead = (item) => {
  if (!item) return null;
  return {
    _id: item._id,
    id: item.id || item._id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || '',
    featuredImage: item.featuredImage || item.image || '',
    category: item.category || null,
  };
};

const attachAlsoRead = async (article) => {
  if (!article?._id) return article;
  const postId = Number(article.wpPostId || article._id);
  const categoryId = article.category?._id || article.category?.id || null;
  let mode = 'auto';
  let chosenId = '';

  try {
    const [metaRows] = await pool().query(
      `SELECT meta_value FROM ${wpTable('postmeta')}
       WHERE post_id = ? AND meta_key = ? LIMIT 1`,
      [postId, ALSO_READ_META_KEY]
    );
    const raw = String(metaRows[0]?.meta_value || '').trim();
    if (raw === 'none') mode = 'none';
    else if (/^\d+$/.test(raw) && raw !== String(postId)) {
      mode = 'custom';
      chosenId = raw;
    }
  } catch {
    mode = 'auto';
  }

  let options = [];
  if (categoryId) {
    const { rows } = await listPublished({
      limit: 40,
      offset: 0,
      categoryId,
      skipCount: true,
    });
    const hydrated = await hydratePosts(rows);
    options = hydrated
      .filter((item) => String(item._id) !== String(postId))
      .map(summarizeAlsoRead);
  }

  let alsoRead = null;
  if (mode === 'custom') {
    alsoRead = options.find((item) => String(item._id) === chosenId) || null;
    if (!alsoRead && chosenId) {
      // Custom also-read may be from any category (search picker)
      const picked = await fetchPostsByIds([chosenId]);
      const [hydrated] = await hydratePosts(picked);
      if (hydrated) {
        alsoRead = summarizeAlsoRead(hydrated);
      } else {
        mode = 'auto';
      }
    }
  }
  if (mode === 'auto') alsoRead = options[0] || null;
  if (mode === 'none') alsoRead = null;

  article.alsoReadMode = mode;
  article.alsoRead = alsoRead;
  article.alsoReadOptions = options;
  return article;
};

const getFlaggedIds = async (ids, metaKey) => {
  if (!ids.length) return new Set();
  const [rows] = await pool().query(
    `SELECT post_id FROM ${wpTable('postmeta')}
     WHERE meta_key = ? AND meta_value = '1' AND post_id IN (?)`,
    [metaKey, ids]
  );
  return new Set(rows.map((r) => Number(r.post_id)));
};

const hydratePosts = async (rows, flags = {}) => {
  if (!rows?.length) return [];

  const ids = rows.map((r) => Number(r.ID));
  const authorIds = rows.map((r) => Number(r.post_author));
  const lean = flags.lean !== false; // default lean for lists
  const cmsList = Boolean(flags.cmsList);

  const editorMetaKeys = [
    '_io_last_edited_by',
    '_io_last_edited_at',
    '_edit_last',
  ];

  const emptyMap = new Map();
  const emptySet = new Set();

  const [images, authors, categories, tags, views, explainerIds, seoMeta, editMeta] =
    await Promise.all([
      getFeaturedImagesMap(ids),
      getAuthorsMap(authorIds),
      getTermsForPosts(ids, 'category'),
      cmsList ? Promise.resolve(emptyMap) : getTermsForPosts(ids, 'post_tag'),
      getViewCountsMap(ids),
      cmsList
        ? Promise.resolve(emptySet)
        : flags.explainerIds || getFlaggedIds(ids, EXPLAINER_META_KEY),
      // Keep SEO on CMS lists so dashboards can show score / keyphrase filters
      getPostMetaMap(ids, SEO_LOOKUP_KEYS),
      getPostMetaMap(ids, editorMetaKeys),
    ]);

  const editLastIds = [
    ...new Set(
      [...editMeta.values()]
        .map((meta) => Number(meta?._edit_last))
        .filter(Boolean)
    ),
  ];
  const editorsById = editLastIds.length
    ? await getAuthorsMap(editLastIds)
    : new Map();

  return rows.map((row) => {
    const id = Number(row.ID);
    const featuredImage = images.get(id) || '';
    const meta = editMeta.get(id) || {};
    const namedEditor = String(meta._io_last_edited_by || '').trim();
    const editLastUser = editorsById.get(Number(meta._edit_last));
    const wpAuthor = authors.get(Number(row.post_author));
    // Always expose an author object so CMS rows render even if WP user is gone
    const author =
      wpAuthor ||
      (Number(row.post_author)
        ? {
            _id: String(row.post_author),
            name: 'Staff',
            email: '',
            avatar: '',
            bio: '',
          }
        : {
            _id: '0',
            name: 'Unassigned',
            email: '',
            avatar: '',
            bio: '',
          });
    const lastEditedBy = namedEditor
      ? { name: namedEditor }
      : editLastUser
        ? { _id: editLastUser._id, name: editLastUser.name }
        : wpAuthor
          ? {
              _id: wpAuthor._id,
              name: wpAuthor.name,
            }
          : author
            ? { _id: author._id, name: author.name }
            : null;
    const seo = mapSeoFromMeta(seoMeta.get(id) || {}, { featuredImage });
    const article = mapWpPostToArticle(row, {
      lean,
      featuredImage,
      author,
      categories: categories.get(id) || [],
      tags: tags.get(id) || [],
      viewCount: views.get(id) || Number(row.comment_count) || 0,
      isBreaking: flags.breakingIds?.has(id),
      isTrending: flags.trendingIds?.has(id),
      isFeatured: flags.featuredIds?.has(id),
      isDontMiss: flags.dontMissIds?.has(id),
      isExplainer: cmsList ? false : explainerIds.has(id),
      lastEditedBy,
      lastEditedAt: meta._io_last_edited_at || null,
      seo,
    });
    // Same inputs as SeoPanel: full body when available (list queries include content for scoring)
    article.seoScore = scoreListSeo({
      ...article,
      content: row.post_content || article.content || article.excerpt || '',
      featuredImage,
      seo,
    });
    return article;
  });
};

const fetchPostsByIds = async (ids = [], { anyStatus = false } = {}) => {
  const clean = [...new Set(ids.map(Number).filter(Boolean))];
  if (!clean.length) return [];

  const statusSql = anyStatus
    ? `p.post_type = 'post'`
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
  authorId = null,
  orderBy = 'date',
  metaFlag = null,
  skipCount = false,
  // Public typeahead ranks by title-word position; Also-read wants pure date order
  rankByTitle = true,
} = {}) => {
  const where = [`p.post_type = 'post'`, `p.post_status = 'publish'`];
  const params = [];

  let join = '';
  const authorN = Number(String(authorId || '').replace(/^wp-/i, ''));
  if (Number.isFinite(authorN) && authorN > 0) {
    where.push(`p.post_author = ?`);
    params.push(authorN);
  }
  if (metaFlag) {
    join += `
      INNER JOIN ${wpTable('postmeta')} pmf
        ON pmf.post_id = p.ID
       AND pmf.meta_key = ?
       AND pmf.meta_value = '1'
    `;
    params.push(metaFlag);
  }
  if (categoryId) {
    // Include child categories so parent archives show the full history
    let categoryIds = [];
    try {
      const wpCategoryService = require('./wpCategoryService');
      categoryIds = await wpCategoryService.getCategoryAndDescendantIds(
        categoryId
      );
    } catch {
      const fallback = Number(String(categoryId).replace(/^wp-/i, ''));
      categoryIds = fallback > 0 ? [fallback] : [];
    }
    if (!categoryIds.length) {
      return { rows: [], total: 0 };
    }
    join += `
      INNER JOIN ${wpTable('term_relationships')} trc
        ON trc.object_id = p.ID
      INNER JOIN ${wpTable('term_taxonomy')} ttc
        ON ttc.term_taxonomy_id = trc.term_taxonomy_id
       AND ttc.taxonomy = 'category'
       AND ttc.term_id IN (?)
    `;
    params.push(categoryIds);
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

  const searchQ = String(search || '').trim();
  if (searchQ) {
    // Heading-focused: match letters/words in the article title
    where.push(`p.post_title LIKE ?`);
    params.push(`%${searchQ}%`);
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

  // Title search: pull a candidate window, rank by word position, then paginate
  // (skipped when rankByTitle=false — e.g. Also-read picker wants newest-first)
  if (searchQ && rankByTitle !== false) {
    const candidateCap = Math.min(500, Math.max(120, limitN * 20));
    const [candidates] = await pool().query(
      `SELECT p.ID, p.post_author, p.post_date, p.post_date_gmt,
              LEFT(p.post_content, 1500) AS post_content,
              p.post_title, p.post_excerpt, p.post_status, p.post_name,
              p.post_modified, p.post_modified_gmt, p.comment_count
       FROM ${wpTable('posts')} p
       ${join}
       WHERE ${whereSql}
       GROUP BY p.ID, p.post_author, p.post_date, p.post_date_gmt,
                LEFT(p.post_content, 1500),
                p.post_title, p.post_excerpt, p.post_status, p.post_name,
                p.post_modified, p.post_modified_gmt, p.comment_count
                ${orderBy === 'views' ? ', ppd.pageviews' : ''}
       ORDER BY ${orderSql}
       LIMIT ?`,
      [...params, candidateCap]
    );
    const ranked = rankRowsByTitle(candidates, searchQ).filter(
      (row) => titleWordRank(row.post_title, searchQ) < Number.MAX_SAFE_INTEGER
    );
    const total = ranked.length;
    const rows = ranked.slice(offsetN, offsetN + limitN);
    return { rows, total };
  }

  let total = 0;
  if (!skipCount) {
    const [countRows] = await pool().query(
      `SELECT COUNT(DISTINCT p.ID) AS total
       FROM ${wpTable('posts')} p
       ${join}
       WHERE ${whereSql}`,
      params
    );
    total = Number(countRows[0]?.total || 0);
  }

  const [rows] = await pool().query(
    `SELECT p.ID, p.post_author, p.post_date, p.post_date_gmt,
            LEFT(p.post_content, 1500) AS post_content,
            p.post_title, p.post_excerpt, p.post_status, p.post_name,
            p.post_modified, p.post_modified_gmt, p.comment_count
     FROM ${wpTable('posts')} p
     ${join}
     WHERE ${whereSql}
     GROUP BY p.ID, p.post_author, p.post_date, p.post_date_gmt,
              LEFT(p.post_content, 1500),
              p.post_title, p.post_excerpt, p.post_status, p.post_name,
              p.post_modified, p.post_modified_gmt, p.comment_count
              ${orderBy === 'views' ? ', ppd.pageviews' : ''}
     ORDER BY ${orderSql}
     LIMIT ? OFFSET ?`,
    [...params, limitN, offsetN]
  );

  if (skipCount) total = rows.length;

  return { rows, total };
};

const getArticles = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const sort = String(query.sort || query.orderBy || '').toLowerCase();
  const rankByTitle = sort !== 'date' && sort !== 'published' && sort !== 'publish';

  const { rows, total } = await listPublished({
    limit,
    offset: skip,
    search: query.search || '',
    categoryId: query.category || null,
    tagId: query.tag || null,
    authorId: query.author || null,
    orderBy: 'date',
    rankByTitle,
  });

  // Lean list hydrate — skip SEO/tags for category/archive pages
  const articles = await hydratePosts(rows, { lean: true, cmsList: true });
  return { articles, meta: buildPaginationMeta(total, page, limit) };
};

const getArticleBySlug = async (slug, incrementView = false) => {
  const [rows] = await pool().query(
    `SELECT p.*
     FROM ${wpTable('posts')} p
     WHERE p.post_name = ?
       AND ${PUBLISHED}
     LIMIT 1`,
    [slug]
  );

  if (!rows.length) throw new ApiError(404, 'Article not found');

  const [article] = await hydratePosts(rows, { lean: false });
  if (incrementView && article?._id) {
    try {
      const { incrementPostView } = require('./wpHelpers');
      const views = await incrementPostView(article._id);
      if (views > 0) {
        article.viewCount = Math.max(Number(article.viewCount) || 0, views);
      }
    } catch (err) {
      console.warn('getArticleBySlug view increment:', err.message);
    }
  }
  return attachAlsoRead(article);
};

const getArticleById = async (id) => {
  const rows = await fetchPostsByIds([id], { anyStatus: true });
  if (!rows.length) throw new ApiError(404, 'Article not found');
  const [article] = await hydratePosts(rows, { lean: false });
  return attachAlsoRead(article);
};

const getLatestNews = async (limit = 10) => {
  const { rows } = await listPublished({ limit, offset: 0, skipCount: true });
  return hydratePosts(rows);
};

const getFeaturedNews = async (limit = 6) => {
  // Top News = most recently published stories
  const { rows } = await listPublished({ limit, offset: 0, skipCount: true });
  const featuredIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { featuredIds });
};

const getBreakingNews = async (limit = 5) => {
  // WordPress has no breaking flag — use the newest published posts
  const { rows } = await listPublished({ limit, offset: 0, skipCount: true });
  const breakingIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { breakingIds });
};

const getTrendingNews = async (limit = 5) => {
  // Prefer view-sorted; fall back to recent
  let rows = [];
  try {
    const result = await listPublished({
      limit,
      offset: 0,
      orderBy: 'views',
      skipCount: true,
    });
    rows = result.rows;
  } catch {
    const result = await listPublished({ limit, offset: 0, skipCount: true });
    rows = result.rows;
  }
  const trendingIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { trendingIds });
};

const getDontMissNews = async (limit = 6) => {
  // Next slice after the latest hero batch
  const { rows } = await listPublished({ limit, offset: 6, skipCount: true });
  const dontMissIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { dontMissIds });
};

const getExplainerNews = async (limit = 6) => {
  const limitN = Math.max(1, Number(limit) || 6);

  // Prefer explicit CMS flag; also include posts in the Explainer category.
  try {
    await wpCategoryService.ensureExplainerCategory();
  } catch (err) {
    console.warn('ensureExplainerCategory:', err.message);
  }
  const [flagged, categoryId] = await Promise.all([
    listPublished({
      limit: limitN,
      offset: 0,
      metaFlag: EXPLAINER_META_KEY,
      skipCount: true,
    }),
    wpCategoryService.getExplainerCategoryId(),
  ]);

  let byCategory = { rows: [] };
  if (categoryId) {
    byCategory = await listPublished({
      limit: limitN,
      offset: 0,
      categoryId,
      skipCount: true,
    });
  }

  const byId = new Map();
  [...flagged.rows, ...byCategory.rows].forEach((row) => {
    const id = Number(row.ID);
    if (!byId.has(id)) byId.set(id, row);
  });

  const rows = [...byId.values()]
    .sort((a, b) => {
      const da = new Date(a.post_date_gmt || a.post_date || 0).getTime();
      const db = new Date(b.post_date_gmt || b.post_date || 0).getTime();
      return db - da || Number(b.ID) - Number(a.ID);
    })
    .slice(0, limitN);

  const explainerIds = new Set(rows.map((r) => Number(r.ID)));
  return hydratePosts(rows, { explainerIds });
};

const getMostReadNews = async (limit = 5) => {
  let rows = [];
  try {
    const result = await listPublished({
      limit,
      offset: 0,
      orderBy: 'views',
      skipCount: true,
    });
    rows = result.rows;
  } catch {
    const result = await listPublished({ limit, offset: 0, skipCount: true });
    rows = result.rows;
  }
  return hydratePosts(rows);
};

const cmsBinStatuses = (bin = 'active') => {
  const key = String(bin || 'active').toLowerCase();
  if (key === 'trash') return ['trash'];
  if (key === 'archived' || key === 'archive') return ['archived'];
  return ['publish', 'draft', 'pending', 'private', 'future'];
};

/**
 * CMS: posts for admin/author lists. Default bin is live editorial
 * (draft / pending / publish). Archive and trash are separate bins.
 * Uses real SQL pagination so old years (2024/2025/…) remain reachable.
 */
const listAllForCms = async ({
  search = '',
  authorId = null,
  hardLimit = null,
  page = 1,
  limit = 40,
  bin = 'active',
  date = '',
  status = '',
  categoryId = '',
  seo = '',
} = {}) => {
  let statuses = cmsBinStatuses(bin);
  const statusKey = String(status || '').toLowerCase();
  if (statusKey && statusKey !== 'all') {
    const mapped =
      statusKey === 'published' ? 'publish' : statusKey;
    if (statuses.includes(mapped)) statuses = [mapped];
  }

  const where = [
    `p.post_type = 'post'`,
    `p.post_status IN (${statuses.map(() => '?').join(', ')})`,
  ];
  const params = [...statuses];

  // authorId null/undefined => all authors (including missing/unassigned)
  if (authorId) {
    where.push(`p.post_author = ?`);
    params.push(Number(authorId));
  }

  const searchQ = String(search || '').trim();
  if (searchQ) {
    // Same as public site: headline letter/word match from 1 character
    where.push(`p.post_title LIKE ?`);
    params.push(`%${searchQ}%`);
  }

  if (date) {
    where.push(`DATE(p.post_date) = ?`);
    params.push(String(date).slice(0, 10));
  }

  if (categoryId) {
    let categoryIds = [];
    try {
      const wpCategoryService = require('./wpCategoryService');
      categoryIds = await wpCategoryService.getCategoryAndDescendantIds(
        categoryId
      );
    } catch {
      const fallback = Number(String(categoryId).replace(/^wp-/i, ''));
      categoryIds = fallback > 0 ? [fallback] : [];
    }
    if (categoryIds.length) {
      where.push(`EXISTS (
        SELECT 1
        FROM ${wpTable('term_relationships')} tr
        INNER JOIN ${wpTable('term_taxonomy')} tt
          ON tt.term_taxonomy_id = tr.term_taxonomy_id
        WHERE tr.object_id = p.ID
          AND tt.taxonomy = 'category'
          AND tt.term_id IN (?)
      )`);
      params.push(categoryIds);
    }
  }

  const seoKey = String(seo || '').toLowerCase();
  const seoDone =
    seoKey === 'done' || seoKey === 'optimized';
  const seoNotDone =
    seoKey === 'not_done' ||
    seoKey === 'incomplete' ||
    seoKey === 'pending' ||
    seoKey === 'needs_work';

  // SEO done = focus keyphrase set; SEO not done = no focus keyphrase
  if (seoDone || seoNotDone) {
    const placeholders = FOCUS_KEYPHRASE_META_KEYS.map(() => '?').join(', ');
    const focusExists = `EXISTS (
      SELECT 1
      FROM ${wpTable('postmeta')} pm_seo
      WHERE pm_seo.post_id = p.ID
        AND pm_seo.meta_key IN (${placeholders})
        AND TRIM(COALESCE(pm_seo.meta_value, '')) <> ''
    )`;
    where.push(seoDone ? focusExists : `NOT ${focusExists}`);
    params.push(...FOCUS_KEYPHRASE_META_KEYS);
  }

  const whereSql = where.join(' AND ');
  const pageN = Math.max(1, parseInt(page, 10) || 1);
  // hardLimit kept for merge callers that still want a capped window
  const limitN = hardLimit
    ? Math.min(5000, Math.max(1, Number(hardLimit) || 2000))
    : Math.min(100, Math.max(1, parseInt(limit, 10) || 40));
  const offsetN = hardLimit ? 0 : (pageN - 1) * limitN;

  // Include post_content so list SEO scores match the in-editor SeoPanel score
  const listSql = `SELECT p.ID, p.post_author, p.post_date, p.post_date_gmt,
            p.post_content,
            p.post_title, p.post_excerpt, p.post_status, p.post_name,
            p.post_modified, p.post_modified_gmt, p.comment_count
     FROM ${wpTable('posts')} p
     WHERE ${whereSql}
     ORDER BY p.post_date_gmt DESC, p.ID DESC`;

  // Search matches headlines, but CMS lists always sort by publish date
  // (newest first) — not by word position in the title.
  const [[countRow], [pageRows]] = await Promise.all([
    pool().query(
      `SELECT COUNT(*) AS total
       FROM ${wpTable('posts')} p
       WHERE ${whereSql}`,
      params
    ),
    pool().query(`${listSql} LIMIT ? OFFSET ?`, [...params, limitN, offsetN]),
  ]);
  let total = Number(countRow?.[0]?.total || 0);
  let rows = pageRows;
  if (hardLimit) total = rows.length;

  const articles = await hydratePosts(rows, { lean: true, cmsList: true });
  const allowed = new Set(
    statuses.map((s) => (s === 'publish' ? 'published' : s))
  );
  const filtered = articles.filter((article) =>
    allowed.has(String(article.status || '').toLowerCase())
  );

  return {
    articles: filtered,
    total,
    page: pageN,
    limit: limitN,
  };
};

const countCmsBins = async ({ authorId = null } = {}) => {
  const where = [`post_type = 'post'`];
  const params = [];
  if (authorId) {
    where.push('post_author = ?');
    params.push(Number(authorId));
  }
  const [rows] = await pool().query(
    `SELECT
       SUM(CASE WHEN post_status IN ('publish', 'draft', 'pending', 'private', 'future') THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN post_status = 'archived' THEN 1 ELSE 0 END) AS archived,
       SUM(CASE WHEN post_status = 'trash' THEN 1 ELSE 0 END) AS trash
     FROM ${wpTable('posts')}
     WHERE ${where.join(' AND ')}`,
    params
  );
  const row = rows[0] || {};
  return {
    active: Number(row.active || 0),
    archived: Number(row.archived || 0),
    trash: Number(row.trash || 0),
  };
};

/**
 * CMS: articles by WordPress author ID (for author dashboard merge).
 */
const getArticlesByAuthor = async (wpAuthorId, query = {}) => {
  const result = await listAllForCms({
    authorId: wpAuthorId,
    search: query.search || '',
    page: query.page || 1,
    limit: query.limit || 40,
    bin: query.bin || 'active',
    date: query.date || '',
    status: query.status || '',
  });
  return result.articles;
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
  getExplainerNews,
  getMostReadNews,
  getArticlesByAuthor,
  listAllForCms,
  countCmsBins,
  EXPLAINER_META_KEY,
};
