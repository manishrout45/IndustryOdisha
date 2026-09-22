const { getMysqlPool, wpTable, getWpTablePrefix } = require('../../config/mysql');

let cachedSiteUrl = null;

const pool = () => getMysqlPool();

const getSiteUrl = async () => {
  if (cachedSiteUrl) return cachedSiteUrl;
  if (process.env.WP_SITE_URL) {
    cachedSiteUrl = String(process.env.WP_SITE_URL).replace(/\/$/, '');
    return cachedSiteUrl;
  }

  const [rows] = await pool().query(
    `SELECT option_value AS value
     FROM ${wpTable('options')}
     WHERE option_name = 'siteurl'
     LIMIT 1`
  );
  cachedSiteUrl = String(rows[0]?.value || 'https://www.industryodisha.com').replace(
    /\/$/,
    ''
  );
  return cachedSiteUrl;
};

const uploadsUrl = async (relativePath) => {
  if (!relativePath) return '';
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const base = await getSiteUrl();
  const clean = String(relativePath).replace(/^\/+/, '');
  return `${base}/wp-content/uploads/${clean}`;
};

/**
 * Resolve featured image URL for many post IDs.
 * Prefers CMS-stored `_io_featured_image` / `_io_external_image`, then WP thumbnail.
 */
const getFeaturedImagesMap = async (postIds = []) => {
  const ids = [...new Set(postIds.map(Number).filter(Boolean))];
  if (!ids.length) return new Map();

  const out = new Map();

  // 1) Direct CMS URL meta (Cloudinary / API) — most reliable for new uploads
  const [ioRows] = await pool().query(
    `SELECT post_id, meta_key, meta_value
     FROM ${wpTable('postmeta')}
     WHERE meta_key IN ('_io_featured_image', '_io_external_image')
       AND post_id IN (?)`,
    [ids]
  );
  for (const row of ioRows) {
    const url = String(row.meta_value || '').trim();
    if (!url) continue;
    const pid = Number(row.post_id);
    if (!out.has(pid) || row.meta_key === '_io_featured_image') {
      out.set(pid, url);
    }
  }

  const missingIds = ids.filter((id) => !out.has(id));
  if (!missingIds.length) return out;

  // 2) Classic WP thumbnail → attached file / guid
  const [thumbRows] = await pool().query(
    `SELECT post_id, meta_value AS thumb_id
     FROM ${wpTable('postmeta')}
     WHERE meta_key = '_thumbnail_id'
       AND post_id IN (?)`,
    [missingIds]
  );

  const thumbByPost = new Map(
    thumbRows.map((r) => [Number(r.post_id), Number(r.thumb_id)])
  );
  const thumbIds = [...new Set([...thumbByPost.values()].filter(Boolean))];
  if (!thumbIds.length) return out;

  const [fileRows] = await pool().query(
    `SELECT post_id, meta_value AS file_path
     FROM ${wpTable('postmeta')}
     WHERE meta_key = '_wp_attached_file'
       AND post_id IN (?)`,
    [thumbIds]
  );
  const fileByThumb = new Map(
    fileRows.map((r) => [Number(r.post_id), r.file_path])
  );

  const needGuid = thumbIds.filter((id) => !fileByThumb.has(id));
  if (needGuid.length) {
    const [guidRows] = await pool().query(
      `SELECT ID, guid FROM ${wpTable('posts')} WHERE ID IN (?)`,
      [needGuid]
    );
    guidRows.forEach((r) => {
      if (r.guid) fileByThumb.set(Number(r.ID), r.guid);
    });
  }

  // Also prefer attachment guid when it is already an absolute URL
  const [allGuidRows] = await pool().query(
    `SELECT ID, guid FROM ${wpTable('posts')} WHERE ID IN (?)`,
    [thumbIds]
  );
  const guidByThumb = new Map(
    allGuidRows.map((r) => [Number(r.ID), r.guid])
  );

  for (const [postId, thumbId] of thumbByPost.entries()) {
    if (out.has(postId)) continue;
    const guid = guidByThumb.get(thumbId);
    if (guid && /^https?:\/\//i.test(String(guid))) {
      out.set(postId, String(guid));
      continue;
    }
    const pathOrUrl = fileByThumb.get(thumbId);
    if (!pathOrUrl) continue;
    out.set(postId, await uploadsUrl(pathOrUrl));
  }
  return out;
};

const getAuthorsMap = async (authorIds = []) => {
  const ids = [...new Set(authorIds.map(Number).filter(Boolean))];
  if (!ids.length) return new Map();

  const [rows] = await pool().query(
    `SELECT ID, user_login, user_email, display_name
     FROM ${wpTable('users')}
     WHERE ID IN (?)`,
    [ids]
  );

  return new Map(
    rows.map((u) => [
      Number(u.ID),
      {
        _id: String(u.ID),
        name: u.display_name || u.user_login || 'Staff Reporter',
        email: u.user_email || '',
        avatar: '',
        bio: '',
        role: 'author',
      },
    ])
  );
};

const getTermsForPosts = async (postIds = [], taxonomy) => {
  const ids = [...new Set(postIds.map(Number).filter(Boolean))];
  if (!ids.length) return new Map();

  const [rows] = await pool().query(
    `SELECT tr.object_id AS post_id,
            t.term_id,
            t.name,
            t.slug,
            tt.parent
     FROM ${wpTable('term_relationships')} tr
     INNER JOIN ${wpTable('term_taxonomy')} tt
       ON tt.term_taxonomy_id = tr.term_taxonomy_id
     INNER JOIN ${wpTable('terms')} t
       ON t.term_id = tt.term_id
     WHERE tr.object_id IN (?)
       AND tt.taxonomy = ?`,
    [ids, taxonomy]
  );

  const map = new Map();
  for (const row of rows) {
    const postId = Number(row.post_id);
    const list = map.get(postId) || [];
    list.push({
      _id: String(row.term_id),
      name: row.name,
      slug: row.slug,
      parent: row.parent ? String(row.parent) : null,
    });
    map.set(postId, list);
  }
  return map;
};

const getViewCountsMap = async (postIds = []) => {
  const ids = [...new Set(postIds.map(Number).filter(Boolean))];
  if (!ids.length) return new Map();
  const prefix = getWpTablePrefix();
  const map = new Map();

  // Prefer post_views if present
  try {
    const [rows] = await pool().query(
      `SELECT id AS post_id, COUNT(*) AS views
       FROM ${wpTable('post_views')}
       WHERE id IN (?)
       GROUP BY id`,
      [ids]
    );
    rows.forEach((r) => map.set(Number(r.post_id), Number(r.views) || 0));
    if (map.size) return map;
  } catch {
    /* table shape may differ */
  }

  try {
    const [rows] = await pool().query(
      `SELECT postid AS post_id, pageviews AS views
       FROM ${wpTable('popularpostsdata')}
       WHERE postid IN (?)`,
      [ids]
    );
    rows.forEach((r) => map.set(Number(r.post_id), Number(r.views) || 0));
  } catch {
    /* optional */
  }

  // meta fallback
  try {
    const [rows] = await pool().query(
      `SELECT post_id, meta_value AS views
       FROM ${wpTable('postmeta')}
       WHERE meta_key IN ('post_views_count', 'views', '_views')
         AND post_id IN (?)`,
      [ids]
    );
    rows.forEach((r) => {
      const n = parseInt(r.views, 10);
      if (!Number.isNaN(n)) map.set(Number(r.post_id), n);
    });
  } catch {
    /* ignore */
  }

  void prefix;
  return map;
};

const getStickyPostIds = async () => {
  try {
    const [rows] = await pool().query(
      `SELECT option_value AS value
       FROM ${wpTable('options')}
       WHERE option_name = 'sticky_posts'
       LIMIT 1`
    );
    const raw = rows[0]?.value;
    if (!raw) return [];
    // PHP serialized array of ints: a:2:{i:0;i:123;i:1;i:456;}
    const ids = [...String(raw).matchAll(/i:(\d+);/g)].map((m) => Number(m[1]));
    // first match is count sometimes: a:N:{ — filter plausible post ids (>0)
    return [...new Set(ids.filter((id) => id > 0))];
  } catch {
    return [];
  }
};

module.exports = {
  pool,
  getSiteUrl,
  uploadsUrl,
  getFeaturedImagesMap,
  getAuthorsMap,
  getTermsForPosts,
  getViewCountsMap,
  getStickyPostIds,
};
