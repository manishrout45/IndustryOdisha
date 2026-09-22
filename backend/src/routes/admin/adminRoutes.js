const express = require('express');
const adminController = require('../../controllers/admin/adminController');
const protect = require('../../middleware/auth/protect');
const authorize = require('../../middleware/auth/authorize');
const upload = require('../../middleware/upload');
const { homepageVideoUpload } = require('../../middleware/upload');
const validate = require('../../middleware/validate');
const { registerValidator, changePasswordValidator } = require('../../validators/authValidator');
const { articleValidator } = require('../../validators/contentValidator');
const { ROLES } = require('../../config/constants');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

// routes/admin.js

router.get('/users', adminController.getUsers);

router.post('/users', registerValidator, validate, adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser); // ADD THIS

// Articles
router.get('/articles', adminController.getArticles);

router.get('/articles/:id', adminController.getArticle);

router.post(
  '/articles',
  upload.single('featuredImage'),
  articleValidator,
  validate,
  adminController.createArticle
);

router.patch(
  '/articles/:id',
  upload.single('featuredImage'),
  adminController.updateArticle
);

router.delete(
  '/articles/:id',
  adminController.deleteArticle
);

router.patch(
  '/articles/:id/approve',
  adminController.approveArticle
);
// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/reorder', adminController.reorderCategories);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Tags
router.get('/tags', adminController.getTags);
router.post('/tags', adminController.createTag);
router.patch('/tags/:id', adminController.updateTag);
router.delete('/tags/:id', adminController.deleteTag);

// Comments
router.get('/comments', adminController.getComments);
router.patch('/comments/:id/moderate', adminController.moderateComment);
router.delete('/comments/:id', adminController.deleteComment);

// Media
router.get('/media', adminController.getMedia);
router.post('/media', upload.single('file'), adminController.uploadMedia);
router.delete('/media/:id', adminController.deleteMedia);

// Advertisements
router.get('/ads', adminController.getAds);
router.post('/ads', upload.single('image'), adminController.createAd);
router.patch('/ads/:id', upload.single('image'), adminController.updateAd);
router.delete('/ads/:id', adminController.deleteAd);

router.get('/videos', adminController.getVideos);
router.post(
  '/videos',
  homepageVideoUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  adminController.createVideo
);
router.patch(
  '/videos/:id',
  homepageVideoUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  adminController.updateVideo
);
router.delete('/videos/:id', adminController.deleteVideo);

// Newsletter
router.get('/newsletter/subscribers', adminController.getSubscribers);
router.post('/newsletter/send', adminController.sendNewsletterNow);

// SEO
router.get('/seo', adminController.getSeo);
router.patch('/seo', adminController.updateSeo);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Homepage Builder
router.get('/homepage-sections', adminController.getHomepageSections);
router.post(
  '/homepage-sections/ensure-defaults',
  adminController.ensureHomepageDefaults
);
router.post('/homepage-sections', adminController.createHomepageSection);
router.patch(
  '/homepage-sections/reorder',
  adminController.reorderHomepageSections
);
router.patch('/homepage-sections/:id', adminController.updateHomepageSection);
router.delete('/homepage-sections/:id', adminController.deleteHomepageSection);

module.exports = router;
