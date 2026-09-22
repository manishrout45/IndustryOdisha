require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/user/User');
const Category = require('../models/category/Category');
const HomepageSection = require('../models/homepage/HomepageSection');
const SiteSeo = require('../models/seo/SiteSeo');
const { ROLES, HOMEPAGE_SECTION_TYPES } = require('../config/constants');

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing) {
    console.log('Super admin already exists. Skipping seed.');
    process.exit(0);
  }

  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@newsportal.com',
    password: 'admin123',
    role: ROLES.SUPER_ADMIN,
  });

  const author = await User.create({
    name: 'Demo Author',
    email: 'author@newsportal.com',
    password: 'author123',
    role: ROLES.AUTHOR,
    createdBy: superAdmin._id,
  });

  const categories = await Category.insertMany([
    { name: 'Politics', description: 'Political news and analysis', order: 1, createdBy: superAdmin._id },
    { name: 'Technology', description: 'Tech industry updates', order: 2, createdBy: superAdmin._id },
    { name: 'Sports', description: 'Sports news and scores', order: 3, createdBy: superAdmin._id },
    { name: 'Entertainment', description: 'Movies, music, and culture', order: 4, createdBy: superAdmin._id },
  ]);

  await HomepageSection.insertMany([
    { title: 'Breaking News', type: HOMEPAGE_SECTION_TYPES.BREAKING_NEWS, order: 0, updatedBy: superAdmin._id },
    { title: 'Top News / Featured', type: HOMEPAGE_SECTION_TYPES.HERO, order: 1, updatedBy: superAdmin._id },
    { title: 'Latest News', type: HOMEPAGE_SECTION_TYPES.LATEST, order: 2, updatedBy: superAdmin._id },
    { title: "Don't Miss", type: HOMEPAGE_SECTION_TYPES.DONT_MISS, order: 3, updatedBy: superAdmin._id },
    { title: 'Trending', type: HOMEPAGE_SECTION_TYPES.TRENDING, order: 4, updatedBy: superAdmin._id },
    { title: 'Most Read', type: HOMEPAGE_SECTION_TYPES.MOST_READ, order: 5, updatedBy: superAdmin._id },
    { title: 'Category Sections', type: HOMEPAGE_SECTION_TYPES.CATEGORY_BLOCK, order: 6, updatedBy: superAdmin._id },
    { title: 'Videos', type: HOMEPAGE_SECTION_TYPES.VIDEO, order: 7, updatedBy: superAdmin._id },
    { title: 'Media Gallery', type: HOMEPAGE_SECTION_TYPES.MEDIA_GALLERY, order: 8, updatedBy: superAdmin._id },
  ]);

  await SiteSeo.create({
    siteName: 'News Portal',
    siteDescription: 'Your trusted source for breaking news and in-depth journalism',
    updatedBy: superAdmin._id,
  });

  console.log('Seed completed successfully.');
  console.log('Super Admin: admin@newsportal.com / admin123');
  console.log('Author: author@newsportal.com / author123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
