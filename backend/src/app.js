const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

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
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
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
  res.json({ success: true, message: 'News Portal API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/author', authorRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

module.exports = app;
