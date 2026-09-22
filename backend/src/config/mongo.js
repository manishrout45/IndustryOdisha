const dns = require('dns');
const mongoose = require('mongoose');

/**
 * Windows / ISP DNS often fails on mongodb+srv SRV lookups (querySrv ECONNREFUSED).
 * Prefer public resolvers so Atlas can be reached.
 */
const ensureReliableDns = () => {
  try {
    const current = dns.getServers();
    const preferred = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
    const merged = [...new Set([...preferred, ...current])];
    dns.setServers(merged);
  } catch (err) {
    console.warn('DNS setup skipped:', err.message);
  }
};

/**
 * Connect the app's primary data store (Mongoose models / APIs).
 * All existing Article, User, Category, etc. logic uses this connection.
 */
const connectMongo = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  ensureReliableDns();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  return mongoose.connection;
};

const isMongoReady = () => mongoose.connection.readyState === 1;

module.exports = {
  connectMongo,
  isMongoReady,
  mongoose,
  ensureReliableDns,
};
