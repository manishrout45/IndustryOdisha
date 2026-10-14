/**
 * Tiny in-memory GET cache for public feed endpoints (speeds up tunnel demos).
 */
const store = new Map();

const shortCache = (ttlMs = 30000) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl || req.url;
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    res.set('X-Cache', 'HIT');
    return res.status(hit.status).type('json').send(hit.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    try {
      const body = JSON.stringify(payload);
      store.set(key, {
        status: res.statusCode || 200,
        body,
        expires: Date.now() + ttlMs,
      });
      if (store.size > 200) {
        const first = store.keys().next().value;
        store.delete(first);
      }
    } catch {
      /* ignore cache write errors */
    }
    res.set('X-Cache', 'MISS');
    return originalJson(payload);
  };

  return next();
};

module.exports = shortCache;
