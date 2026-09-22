require('dotenv').config();

// Fix Windows/ISP DNS before any MongoDB SRV lookups
try {
  const { ensureReliableDns } = require('./config/mongo');
  ensureReliableDns();
} catch {
  /* optional */
}

const app = require('./app');
const connectDB = require('./config/db');
const { isMongoReady } = require('./config/mongo');
const { startNewsletterScheduler } = require('./jobs/newsletterJob');
const Category = require('./models/category/Category');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbStatus = await connectDB();

  // Mongo-only maintenance (skip when Mongo is not connected)
  if (isMongoReady()) {
    try {
      await Category.collection.dropIndex('name_1');
    } catch {
      /* index may not exist */
    }
    try {
      await Category.syncIndexes();
    } catch (err) {
      console.warn('Category index sync:', err.message);
    }
  } else {
    console.warn(
      'MongoDB not connected — skipping Category index sync and newsletter scheduler.'
    );
  }

  app.listen(PORT, () => {
    const parts = [];
    if (dbStatus.mongo) parts.push('mongo');
    if (dbStatus.mysql) parts.push('mysql');
    console.log(
      `Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}] db=[${parts.join('+')}]`
    );
    if (isMongoReady()) {
      startNewsletterScheduler();
    }
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
