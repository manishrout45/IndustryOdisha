const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth/authRoutes');
const publicRoutes = require('./routes/public/publicRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const authorRoutes = require('./routes/author/authorRoutes');
const errorHandler = require('./middleware/errorHandler');
const { configureCloudinary } = require('./config/cloudinary');

const app = express();

configureCloudinary();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.AUTHOR_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  const { isMongoReady } = require('./config/mongo');
  const { isMysqlReady } = require('./config/mysql');
  res.json({
    success: true,
    message: 'News Portal API is running',
    db: {
      mongo: isMongoReady(),
      mysql: isMysqlReady(),
      type: process.env.DB_TYPE || 'mongodb',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/author', authorRoutes);

const publicDist = path.join(__dirname, '../../frontend/public-website/dist');
const adminDist = path.join(__dirname, '../../frontend/admin-dashboard/dist');
const authorDist = path.join(__dirname, '../../frontend/author-dashboard/dist');

if (fs.existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist));
}
if (fs.existsSync(authorDist)) {
  app.use('/author', express.static(authorDist));
}
if (fs.existsSync(publicDist)) {
  app.use(express.static(publicDist));
}

/** SPA fallback for client-side routes */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }

  if (req.path === '/admin' || req.path.startsWith('/admin/')) {
    const file = path.join(adminDist, 'index.html');
    if (fs.existsSync(file)) return res.sendFile(file);
  }

  if (req.path === '/author' || req.path.startsWith('/author/')) {
    const file = path.join(authorDist, 'index.html');
    if (fs.existsSync(file)) return res.sendFile(file);
  }

  const publicIndex = path.join(publicDist, 'index.html');
  if (fs.existsSync(publicIndex)) return res.sendFile(publicIndex);

  return next();
});

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

module.exports = app;
