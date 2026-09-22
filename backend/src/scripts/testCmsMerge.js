require('dotenv').config();
require('../models/user/User');
require('../models/category/Category');
require('../models/tag/Tag');
require('../models/article/Article');
const connectDB = require('../config/database');
const articleService = require('../services/breaking-news/articleService');
const { closeMysql } = require('../config/mysql');
const mongoose = require('mongoose');

async function main() {
  await connectDB();

  // Simulate admin user (role admin) — should merge both sources
  const admin = {
    _id: '000000000000000000000001',
    role: 'admin',
    email: 'admin@test.com',
    name: 'Admin',
  };

  const result = await articleService.getArticles({ page: 1, limit: 10 }, admin);
  const sources = {};
  (result.articles || []).forEach((a) => {
    const s = a.source || 'unknown';
    sources[s] = (sources[s] || 0) + 1;
  });

  console.log('merged page size', result.articles?.length);
  console.log('meta', result.meta);
  console.log('sources on page', sources);
  console.log(
    'sample',
    (result.articles || []).slice(0, 5).map((a) => ({
      source: a.source,
      title: String(a.title || '').slice(0, 50),
      slug: a.slug,
    }))
  );

  await closeMysql();
  if (mongoose.connection.readyState) await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
