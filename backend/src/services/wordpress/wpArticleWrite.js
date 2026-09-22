const path = require('path');
const fs = require('fs');
const ApiError = require('../../utils/ApiError');
const { generateSlug } = require('../../utils/slugify');
const { ARTICLE_STATUS } = require('../../config/constants');
const {
  getMysqlPool,
  wpTable,
  isMysqlReady,
} = require('../../config/mysql');
const { getSiteUrl } = require('./wpHelpers');
const { findWpUserIdForCmsUser } = require('./wpCmsMerge');
const wpArticleService = require('./wpArticleService');

const pool = () => getMysqlPool();

const toWpStatus = (status) => {
  const s = String(status || 'draft').toLowerCase();
  if (s === 'published' || s === 'publish') return 'publish';
  if (s === 'pending') return 'pending';
  if (s === 'trash') return 'trash';
  return 'draft';
};

const fromWpStatus = (status) =>
  status === 'publish' ? ARTICLE_STATUS.PUBLISHED : status;

const uniquePostSlug = async (base, excludeId = null) => {
  let slug = generateSlug(base || 'article') || `post-${Date.now()}`;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const params = [candidate];
    let sql = `SELECT ID FROM ${wpTable('posts')} WHERE post_name = ? AND post_type = 'post'`;
    if (excludeId) {
      sql += ' AND ID <> ?';
      params.push(Number(excludeId));
    }
    sql += ' LIMIT 1';
    const [rows] = await pool().query(sql, params);
    if (!rows.length) return candidate;
    i += 1;
    if (i > 50) return `${slug}-${Date.now()}`;
  }
};

const ensureWpUser = async (cmsUser) => {
  let wpId = await findWpUserIdForCmsUser(cmsUser);
  if (wpId) return wpId;

  if (!cmsUser?.email && !cmsUser?.name) {
    // Fallback to first admin-ish WP user
    const [rows] = await pool().query(
      `SELECT ID FROM ${wpTable('users')} ORDER BY ID ASC LIMIT 1`
    );
    if (!rows.length) throw new ApiError(500, 'No WordPress users found');
    return Number(rows[0].ID);
  }

  const loginBase =
    generateSlug(cmsUser.email?.split('@')[0] || cmsUser.name || 'author') ||
    `user${Date.now()}`;
  let login = loginBase;
  let n = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [exists] = await pool().query(
      `SELECT ID FROM ${wpTable('users')} WHERE user_login = ? LIMIT 1`,
      [login]
    );
    if (!exists.length) break;
    n += 1;
    login = `${loginBase}${n}`;
  }

  const email = cmsUser.email || `${login}@industryodisha.local`;
  const display = cmsUser.name || login;
  const now = new Date();

  const [result] = await pool().query(
    `INSERT INTO ${wpTable('users')}
      (user_login, user_pass, user_nicename, user_email, user_url, user_registered,
       user_activation_key, user_status, display_name)
     VALUES (?, '', ?, ?, '', ?, '', 0, ?)`,
    [login, generateSlug(display) || login, email, now, display]
  );

  wpId = Number(result.insertId);

  // Mark as author capability (best-effort; WP serializes roles in usermeta)
  try {
    await pool().query(
      `INSERT INTO ${wpTable('usermeta')} (user_id, meta_key, meta_value)
       VALUES (?, ?, ?), (?, ?, ?)`,
      [
        wpId,
        `${process.env.WP_TABLE_PREFIX || 'xx1o_'}capabilities`,
        'a:1:{s:6:"author";b:1;}',
        wpId,
        `${process.env.WP_TABLE_PREFIX || 'xx1o_'}user_level`,
        '2',
      ]
    );
  } catch {
    /* optional */
  }

  return wpId;
};

const getTermTaxonomyId = async (termId, taxonomy = 'category') => {
  const id = Number(String(termId).replace(/^wp-/i, ''));
  if (!id) return null;
  const [rows] = await pool().query(
    `SELECT term_taxonomy_id FROM ${wpTable('term_taxonomy')}
     WHERE term_id = ? AND taxonomy = ?
     LIMIT 1`,
    [id, taxonomy]
  );
  return rows[0]?.term_taxonomy_id ? Number(rows[0].term_taxonomy_id) : null;
};

const setPostTerms = async (postId, termIds = [], taxonomy = 'category') => {
  const ids = (Array.isArray(termIds) ? termIds : [termIds])
    .map((t) => Number(String(t).replace(/^wp-/i, '')))
    .filter(Boolean);

  // Remove existing terms of this taxonomy
  await pool().query(
    `DELETE tr FROM ${wpTable('term_relationships')} tr
     INNER JOIN ${wpTable('term_taxonomy')} tt
       ON tt.term_taxonomy_id = tr.term_taxonomy_id
     WHERE tr.object_id = ? AND tt.taxonomy = ?`,
    [postId, taxonomy]
  );

  for (const termId of ids) {
    const ttId = await getTermTaxonomyId(termId, taxonomy);
    if (!ttId) continue;
    await pool().query(
      `INSERT IGNORE INTO ${wpTable('term_relationships')}
        (object_id, term_taxonomy_id, term_order)
       VALUES (?, ?, 0)`,
      [postId, ttId]
    );
    await pool().query(
      `UPDATE ${wpTable('term_taxonomy')}
       SET count = (
         SELECT COUNT(*) FROM ${wpTable('term_relationships')}
         WHERE term_taxonomy_id = ?
       )
       WHERE term_taxonomy_id = ?`,
      [ttId, ttId]
    );
  }
};

const setPostMeta = async (postId, key, value) => {
  const [existing] = await pool().query(
    `SELECT meta_id FROM ${wpTable('postmeta')}
     WHERE post_id = ? AND meta_key = ? LIMIT 1`,
    [postId, key]
  );
  if (existing.length) {
    await pool().query(
      `UPDATE ${wpTable('postmeta')} SET meta_value = ? WHERE meta_id = ?`,
      [String(value), existing[0].meta_id]
    );
  } else {
    await pool().query(
      `INSERT INTO ${wpTable('postmeta')} (post_id, meta_key, meta_value)
       VALUES (?, ?, ?)`,
      [postId, key, String(value)]
    );
  }
};

const updateSticky = async (postId, featured) => {
  const [rows] = await pool().query(
    `SELECT option_id, option_value FROM ${wpTable('options')}
     WHERE option_name = 'sticky_posts' LIMIT 1`
  );
  let ids = [];
  if (rows[0]?.option_value) {
    ids = [...String(rows[0].option_value).matchAll(/i:(\d+);/g)]
      .map((m) => Number(m[1]))
      .filter((id) => id > 0);
    // PHP serialize often starts with count as first i:N — keep unique post ids only
    ids = [...new Set(ids)];
  }
  const id = Number(postId);
  if (featured) {
    if (!ids.includes(id)) ids.unshift(id);
  } else {
    ids = ids.filter((x) => x !== id);
  }
  // Rebuild simple PHP serialized array
  let ser = `a:${ids.length}:{`;
  ids.forEach((pid, i) => {
    ser += `i:${i};i:${pid};`;
  });
  ser += '}';

  if (rows[0]) {
    await pool().query(
      `UPDATE ${wpTable('options')} SET option_value = ? WHERE option_id = ?`,
      [ser, rows[0].option_id]
    );
  } else {
    await pool().query(
      `INSERT INTO ${wpTable('options')} (option_name, option_value, autoload)
       VALUES ('sticky_posts', ?, 'yes')`,
      [ser]
    );
  }
};

/**
 * Resolve a multer / CMS path to an absolute filesystem path.
 */
const resolveLocalImagePath = (featuredImage) => {
  if (!featuredImage) return null;
  let raw = String(featuredImage).trim();
  if (!raw || /^https?:\/\//i.test(raw)) return null;

  // Normalize Windows + unix separators; strip leading slash for relative uploads
  const normalized = raw.replace(/\\/g, '/').replace(/^\//, '');

  const candidates = [];

  // True absolute Windows path (C:\...) or unc
  if (path.win32.isAbsolute(raw) || path.posix.isAbsolute(raw)) {
    candidates.push(raw);
    candidates.push(path.normalize(raw));
  }

  candidates.push(
    path.resolve(process.cwd(), normalized),
    path.resolve(process.cwd(), raw),
    path.resolve(__dirname, '../../../', normalized),
    path.resolve(__dirname, '../../../../', normalized)
  );

  for (const c of candidates) {
    try {
      if (c && fs.existsSync(c)) return c;
    } catch {
      /* skip */
    }
  }
  return null;
};

const getApiPublicBase = () => {
  if (process.env.API_PUBLIC_URL) {
    return String(process.env.API_PUBLIC_URL).replace(/\/$/, '');
  }
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

/**
 * Upload local file to Cloudinary (preferred) or expose via API /uploads URL.
 * Saves attachment row + `_io_featured_image` so public reads always get a working URL.
 */
const attachFeaturedImage = async (postId, featuredImagePath, authorId) => {
  const absolute = resolveLocalImagePath(featuredImagePath);
  if (!absolute) {
    console.warn('Featured image file not found:', featuredImagePath);
    return null;
  }

  let publicUrl = null;

  try {
    const { cloudinary } = require('../../config/cloudinary');
    const result = await cloudinary.uploader.upload(absolute, {
      folder: 'news-portal/articles',
    });
    publicUrl = result.secure_url;
  } catch (err) {
    console.warn('Cloudinary upload failed, using local URL:', err.message);
    const rel = path
      .relative(process.cwd(), absolute)
      .replace(/\\/g, '/');
    publicUrl = `${getApiPublicBase()}/${rel.replace(/^\//, '')}`;
  }

  try {
    if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
  } catch {
    /* optional cleanup */
  }

  return attachRemoteFeaturedImage(postId, publicUrl, authorId);
};

/** Link an external (e.g. Cloudinary) image URL as the post thumbnail. */
const attachRemoteFeaturedImage = async (postId, imageUrl, authorId) => {
  if (!imageUrl || !String(imageUrl).startsWith('http')) return null;

  const now = new Date();
  const filename =
    String(imageUrl).split('/').pop()?.split('?')[0] || `remote-${Date.now()}.jpg`;
  const mime =
    filename.match(/\.png$/i) ? 'image/png'
    : filename.match(/\.webp$/i) ? 'image/webp'
    : filename.match(/\.gif$/i) ? 'image/gif'
    : 'image/jpeg';

  const [ins] = await pool().query(
    `INSERT INTO ${wpTable('posts')}
      (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt,
       post_status, comment_status, ping_status, post_password, post_name, to_ping, pinged,
       post_modified, post_modified_gmt, post_content_filtered, post_parent, guid,
       menu_order, post_type, post_mime_type, comment_count)
     VALUES (?, ?, ?, '', ?, '', 'inherit', 'open', 'closed', '', ?, '', '', ?, ?, '', ?, ?, 0, 'attachment', ?, 0)`,
    [
      authorId || 1,
      now,
      now,
      filename,
      generateSlug(filename.replace(/\.[^.]+$/, '')) || `image-${Date.now()}`,
      now,
      now,
      postId,
      imageUrl,
      mime,
    ]
  );

  const attachmentId = Number(ins.insertId);
  await setPostMeta(postId, '_thumbnail_id', String(attachmentId));
  await setPostMeta(postId, '_io_featured_image', imageUrl);
  await setPostMeta(postId, '_io_external_image', imageUrl);
  return imageUrl;
};

const applyFeaturedImage = async (postId, featuredImage, authorId) => {
  if (!featuredImage) return null;
  const value = String(featuredImage).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    return attachRemoteFeaturedImage(postId, value, authorId);
  }
  return attachFeaturedImage(postId, value, authorId);
};

const createArticle = async (data, cmsUser) => {
  if (!isMysqlReady()) throw new ApiError(503, 'MySQL is not connected');

  const authorId = await ensureWpUser(cmsUser);
  const title = String(data.title || '').trim();
  if (!title) throw new ApiError(400, 'Title is required');

  const content = String(data.content || '');
  const excerpt = String(data.excerpt || '').slice(0, 300);
  const status = toWpStatus(data.status);
  const slug = await uniquePostSlug(data.slug || title);
  const now = new Date();
  const siteUrl = await getSiteUrl();

  const [result] = await pool().query(
    `INSERT INTO ${wpTable('posts')}
      (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt,
       post_status, comment_status, ping_status, post_password, post_name, to_ping, pinged,
       post_modified, post_modified_gmt, post_content_filtered, post_parent, guid,
       menu_order, post_type, post_mime_type, comment_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'closed', '', ?, '', '', ?, ?, '', 0, ?, 0, 'post', '', 0)`,
    [
      authorId,
      now,
      now,
      content,
      title,
      excerpt,
      status,
      slug,
      now,
      now,
      `${siteUrl}/?p=0`,
    ]
  );

  const postId = Number(result.insertId);

  await pool().query(`UPDATE ${wpTable('posts')} SET guid = ? WHERE ID = ?`, [
    `${siteUrl}/?p=${postId}`,
    postId,
  ]);

  if (data.category) {
    await setPostTerms(postId, [data.category], 'category');
  }
  if (Array.isArray(data.tags) && data.tags.length) {
    const tagIds = data.tags
      .map((t) => String(t).replace(/^wp-/i, ''))
      .filter((t) => /^\d+$/.test(t));
    if (tagIds.length) await setPostTerms(postId, tagIds, 'post_tag');
  }

  if (data.featuredImage) {
    await applyFeaturedImage(postId, data.featuredImage, authorId);
  }

  const featured = data.isFeatured === true || data.isFeatured === 'true';
  if (featured) await updateSticky(postId, true);

  // Store CMS flags in postmeta for optional use
  await setPostMeta(postId, '_io_is_breaking', data.isBreaking ? '1' : '0');
  await setPostMeta(postId, '_io_is_trending', data.isTrending ? '1' : '0');
  await setPostMeta(postId, '_io_is_dont_miss', data.isDontMiss ? '1' : '0');
  await setPostMeta(postId, '_io_is_featured', featured ? '1' : '0');

  return wpArticleService.getArticleById(postId);
};

const updateArticle = async (id, data, cmsUser) => {
  if (!isMysqlReady()) throw new ApiError(503, 'MySQL is not connected');
  const postId = Number(String(id).replace(/^wp-/i, ''));
  if (!postId) throw new ApiError(400, 'Invalid WordPress article id');

  const [existing] = await pool().query(
    `SELECT ID, post_name FROM ${wpTable('posts')}
     WHERE ID = ? AND post_type = 'post' LIMIT 1`,
    [postId]
  );
  if (!existing.length) throw new ApiError(404, 'Article not found');

  const fields = [];
  const params = [];
  const now = new Date();

  if (data.title !== undefined) {
    fields.push('post_title = ?');
    params.push(String(data.title).trim());
  }
  if (data.content !== undefined) {
    fields.push('post_content = ?');
    params.push(String(data.content));
  }
  if (data.excerpt !== undefined) {
    fields.push('post_excerpt = ?');
    params.push(String(data.excerpt).slice(0, 300));
  }
  if (data.status !== undefined) {
    fields.push('post_status = ?');
    params.push(toWpStatus(data.status));
  }
  if (data.title) {
    const slug = await uniquePostSlug(data.slug || data.title, postId);
    fields.push('post_name = ?');
    params.push(slug);
  }

  fields.push('post_modified = ?', 'post_modified_gmt = ?');
  params.push(now, now);
  params.push(postId);

  if (fields.length) {
    await pool().query(
      `UPDATE ${wpTable('posts')} SET ${fields.join(', ')} WHERE ID = ?`,
      params
    );
  }

  if (data.category !== undefined && data.category !== '') {
    await setPostTerms(postId, [data.category], 'category');
  }
  if (Array.isArray(data.tags)) {
    const tagIds = data.tags
      .map((t) => String(t).replace(/^wp-/i, ''))
      .filter((t) => /^\d+$/.test(t));
    await setPostTerms(postId, tagIds, 'post_tag');
  }

  if (data.featuredImage) {
    const authorId = await ensureWpUser(cmsUser);
    await applyFeaturedImage(postId, data.featuredImage, authorId);
  }

  if (data.isFeatured !== undefined) {
    const featured = data.isFeatured === true || data.isFeatured === 'true';
    await updateSticky(postId, featured);
    await setPostMeta(postId, '_io_is_featured', featured ? '1' : '0');
  }
  if (data.isBreaking !== undefined) {
    await setPostMeta(
      postId,
      '_io_is_breaking',
      data.isBreaking === true || data.isBreaking === 'true' ? '1' : '0'
    );
  }
  if (data.isTrending !== undefined) {
    await setPostMeta(
      postId,
      '_io_is_trending',
      data.isTrending === true || data.isTrending === 'true' ? '1' : '0'
    );
  }
  if (data.isDontMiss !== undefined) {
    await setPostMeta(
      postId,
      '_io_is_dont_miss',
      data.isDontMiss === true || data.isDontMiss === 'true' ? '1' : '0'
    );
  }

  return wpArticleService.getArticleById(postId);
};

const deleteArticle = async (id) => {
  if (!isMysqlReady()) throw new ApiError(503, 'MySQL is not connected');
  const postId = Number(String(id).replace(/^wp-/i, ''));
  if (!postId) throw new ApiError(400, 'Invalid WordPress article id');

  const [existing] = await pool().query(
    `SELECT ID FROM ${wpTable('posts')} WHERE ID = ? AND post_type = 'post' LIMIT 1`,
    [postId]
  );
  if (!existing.length) throw new ApiError(404, 'Article not found');

  await pool().query(
    `UPDATE ${wpTable('posts')} SET post_status = 'trash' WHERE ID = ?`,
    [postId]
  );
  await updateSticky(postId, false);

  return { _id: String(postId), status: 'trash' };
};

const approveArticle = async (id) =>
  updateArticle(id, { status: 'published' }, null);

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  approveArticle,
  ensureWpUser,
  toWpStatus,
  fromWpStatus,
};
