const ApiError = require('../../utils/ApiError');
const {
  isMysqlReady,
  getMysqlPool,
  wpTable,
  getWpTablePrefix,
} = require('../../config/mysql');
const { HashPassword } = require('wordpress-hash-node');
const { generateSlug } = require('../../utils/slugify');

const pool = () => getMysqlPool();

const mapWpRole = (capabilitiesSerialized = '') => {
  const raw = String(capabilitiesSerialized || '');
  if (raw.includes('"administrator"') || raw.includes('s:13:"administrator"')) {
    return 'admin';
  }
  if (raw.includes('"editor"') || raw.includes('s:6:"editor"')) {
    return 'admin';
  }
  if (raw.includes('"author"') || raw.includes('s:6:"author"')) {
    return 'author';
  }
  if (raw.includes('"contributor"') || raw.includes('s:11:"contributor"')) {
    return 'author';
  }
  return 'author';
};

const toWpCapabilities = (role) => {
  const r = String(role || 'author').toLowerCase();
  if (r === 'admin' || r === 'super-admin' || r === 'administrator') {
    return {
      capabilities: 'a:1:{s:13:"administrator";b:1;}',
      userLevel: '10',
    };
  }
  if (r === 'editor') {
    return {
      capabilities: 'a:1:{s:6:"editor";b:1;}',
      userLevel: '7',
    };
  }
  return {
    capabilities: 'a:1:{s:6:"author";b:1;}',
    userLevel: '2',
  };
};

const parseWpId = (id) => {
  const n = Number(String(id || '').replace(/^wp-/i, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const capsMetaKey = () => `${getWpTablePrefix()}capabilities`;
const levelMetaKey = () => `${getWpTablePrefix()}user_level`;

const toCmsUser = (u, capabilities = '') => ({
  _id: `wp-${u.ID}`,
  id: `wp-${u.ID}`,
  wpUserId: Number(u.ID),
  name: u.display_name || u.user_login || `User ${u.ID}`,
  email: u.user_email || '',
  role: mapWpRole(capabilities || u.capabilities),
  isActive: true,
  avatar: '',
  bio: '',
  source: 'wordpress-mysql',
  postCount: Number(u.post_count) || 0,
  articleCount: Number(u.post_count) || 0,
  createdAt: u.user_registered,
});

const getWpUserById = async (id) => {
  if (!isMysqlReady()) throw new ApiError(503, 'MySQL is not connected');
  const wpId = parseWpId(id);
  if (!wpId) throw new ApiError(400, 'Invalid WordPress user id');

  const [rows] = await pool().query(
    `SELECT u.ID,
            u.user_login,
            u.user_email,
            u.display_name,
            u.user_registered,
            (
              SELECT COUNT(*)
              FROM ${wpTable('posts')} p
              WHERE p.post_author = u.ID
                AND p.post_type = 'post'
                AND p.post_status IN ('publish', 'draft', 'pending', 'private', 'future')
            ) AS post_count,
            (
              SELECT um.meta_value
              FROM ${wpTable('usermeta')} um
              WHERE um.user_id = u.ID AND um.meta_key = ?
              LIMIT 1
            ) AS capabilities
     FROM ${wpTable('users')} u
     WHERE u.ID = ?
     LIMIT 1`,
    [capsMetaKey(), wpId]
  );

  if (!rows.length) throw new ApiError(404, 'WordPress user not found');
  return toCmsUser(rows[0], rows[0].capabilities);
};

/**
 * List WordPress users for the admin Users / Authors screens.
 */
const listWpAuthors = async ({ includeAll = true } = {}) => {
  if (!isMysqlReady()) return [];

  const [rows] = await pool().query(
    includeAll
      ? `SELECT u.ID,
               u.user_login,
               u.user_email,
               u.display_name,
               u.user_registered,
               (
                 SELECT COUNT(*)
                 FROM ${wpTable('posts')} p
                 WHERE p.post_author = u.ID
                   AND p.post_type = 'post'
                   AND p.post_status IN ('publish', 'draft', 'pending', 'private', 'future')
               ) AS post_count,
               (
                 SELECT um.meta_value
                 FROM ${wpTable('usermeta')} um
                 WHERE um.user_id = u.ID
                   AND um.meta_key = ?
                 LIMIT 1
               ) AS capabilities
        FROM ${wpTable('users')} u
        ORDER BY u.display_name ASC`
      : `SELECT u.ID,
               u.user_login,
               u.user_email,
               u.display_name,
               u.user_registered,
               COUNT(p.ID) AS post_count,
               (
                 SELECT um.meta_value
                 FROM ${wpTable('usermeta')} um
                 WHERE um.user_id = u.ID
                   AND um.meta_key = ?
                 LIMIT 1
               ) AS capabilities
        FROM ${wpTable('users')} u
        INNER JOIN ${wpTable('posts')} p
          ON p.post_author = u.ID
         AND p.post_type = 'post'
         AND p.post_status IN ('publish', 'draft', 'pending', 'private', 'future')
        GROUP BY u.ID, u.user_login, u.user_email, u.display_name, u.user_registered
        ORDER BY post_count DESC, u.display_name ASC`,
    [capsMetaKey()]
  );

  return rows.map((u) => toCmsUser(u, u.capabilities));
};

const setUserMeta = async (userId, metaKey, metaValue) => {
  const [existing] = await pool().query(
    `SELECT umeta_id FROM ${wpTable('usermeta')}
     WHERE user_id = ? AND meta_key = ? LIMIT 1`,
    [userId, metaKey]
  );
  if (existing.length) {
    await pool().query(
      `UPDATE ${wpTable('usermeta')} SET meta_value = ? WHERE umeta_id = ?`,
      [String(metaValue), existing[0].umeta_id]
    );
  } else {
    await pool().query(
      `INSERT INTO ${wpTable('usermeta')} (user_id, meta_key, meta_value)
       VALUES (?, ?, ?)`,
      [userId, metaKey, String(metaValue)]
    );
  }
};

const updateWpUser = async (id, updates = {}) => {
  if (!isMysqlReady()) throw new ApiError(503, 'MySQL is not connected');
  const wpId = parseWpId(id);
  if (!wpId) throw new ApiError(400, 'Invalid WordPress user id');

  const [existing] = await pool().query(
    `SELECT ID, user_login, user_email, display_name
     FROM ${wpTable('users')} WHERE ID = ? LIMIT 1`,
    [wpId]
  );
  if (!existing.length) throw new ApiError(404, 'WordPress user not found');

  const fields = [];
  const params = [];

  if (updates.name !== undefined) {
    const name = String(updates.name || '').trim();
    if (!name) throw new ApiError(400, 'Name is required');
    fields.push('display_name = ?');
    params.push(name);
    const nice = generateSlug(name) || existing[0].user_login;
    fields.push('user_nicename = ?');
    params.push(nice);
  }

  if (updates.email !== undefined) {
    const email = String(updates.email || '').trim().toLowerCase();
    if (!email) throw new ApiError(400, 'Email is required');
    const [clash] = await pool().query(
      `SELECT ID FROM ${wpTable('users')}
       WHERE user_email = ? AND ID <> ? LIMIT 1`,
      [email, wpId]
    );
    if (clash.length) throw new ApiError(409, 'Email already in use');
    fields.push('user_email = ?');
    params.push(email);
  }

  if (updates.password) {
    const password = String(updates.password);
    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }
    fields.push('user_pass = ?');
    params.push(HashPassword(password));
  }

  if (fields.length) {
    params.push(wpId);
    await pool().query(
      `UPDATE ${wpTable('users')} SET ${fields.join(', ')} WHERE ID = ?`,
      params
    );
  }

  if (updates.role !== undefined) {
    const { capabilities, userLevel } = toWpCapabilities(updates.role);
    await setUserMeta(wpId, capsMetaKey(), capabilities);
    await setUserMeta(wpId, levelMetaKey(), userLevel);
  }

  if (updates.name !== undefined) {
    await setUserMeta(wpId, 'nickname', String(updates.name).trim());
  }

  return getWpUserById(wpId);
};

const deleteWpUser = async (id, { reassignTo = 1 } = {}) => {
  if (!isMysqlReady()) throw new ApiError(503, 'MySQL is not connected');
  const wpId = parseWpId(id);
  if (!wpId) throw new ApiError(400, 'Invalid WordPress user id');

  const [existing] = await pool().query(
    `SELECT ID FROM ${wpTable('users')} WHERE ID = ? LIMIT 1`,
    [wpId]
  );
  if (!existing.length) throw new ApiError(404, 'WordPress user not found');

  // Don't delete the primary WP admin user (usually ID 1)
  if (wpId === 1) {
    throw new ApiError(403, 'Cannot delete the primary WordPress administrator');
  }

  const target =
    Number(reassignTo) > 0 && Number(reassignTo) !== wpId
      ? Number(reassignTo)
      : 1;

  // Reassign posts/attachments so content is not orphaned
  await pool().query(
    `UPDATE ${wpTable('posts')} SET post_author = ? WHERE post_author = ?`,
    [target, wpId]
  );

  await pool().query(`DELETE FROM ${wpTable('usermeta')} WHERE user_id = ?`, [
    wpId,
  ]);
  await pool().query(`DELETE FROM ${wpTable('users')} WHERE ID = ?`, [wpId]);

  return { _id: `wp-${wpId}`, deleted: true };
};

module.exports = {
  listWpAuthors,
  getWpUserById,
  updateWpUser,
  deleteWpUser,
  mapWpRole,
  parseWpId,
};
