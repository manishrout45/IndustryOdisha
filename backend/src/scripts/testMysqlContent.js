require('dotenv').config();
const connectDB = require('../config/database');
const articleService = require('../services/breaking-news/articleService');
const categoryService = require('../services/categories/categoryService');
const { isMysqlContentMode } = require('../config/dbMode');
const { closeMysql } = require('../config/mysql');
const mongoose = require('mongoose');

async function main() {
  await connectDB();
  console.log('contentMode mysql?', isMysqlContentMode());

  const latest = await articleService.getLatestNews(3);
  console.log(
    'latest:',
    latest.map((a) => ({ id: a._id, slug: a.slug, title: a.title?.slice(0, 60), img: !!a.featuredImage }))
  );

  const cats = await categoryService.getCategories(true, { tree: true });
  console.log('categories roots:', cats.length, cats.slice(0, 5).map((c) => c.name));

  if (latest[0]?.slug) {
    const one = await articleService.getArticleBySlug(latest[0].slug);
    console.log('detail ok:', one.slug, 'content length', (one.content || '').length);
  }

  await closeMysql();
  if (mongoose.connection.readyState) await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
