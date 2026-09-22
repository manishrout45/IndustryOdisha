const express = require('express');
const authorController = require('../../controllers/author/authorController');
const protect = require('../../middleware/auth/protect');
const authorize = require('../../middleware/auth/authorize');
const upload = require('../../middleware/upload');
const validate = require('../../middleware/validate');
const { articleValidator } = require('../../validators/contentValidator');
const { ROLES } = require('../../config/constants');

const router = express.Router();

router.use(protect);

router.use(
  authorize(
    ROLES.AUTHOR,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  )
);

// ==================== Articles ====================

router.get(
  '/articles',
  authorController.getMyArticles
);

router.get(
  '/articles/:id',
  authorController.getArticle
);

router.post(
  '/articles',
  upload.single('featuredImage'),
  articleValidator,
  validate,
  authorController.createArticle
);

router.patch(
  '/articles/:id',
  upload.single('featuredImage'),
  authorController.updateArticle
);

router.delete(
  '/articles/:id',
  authorController.deleteArticle
);

// ==================== Categories ====================

router.get(
  '/categories',
  authorController.getCategories
);

// ==================== Comments ====================

router.get(
  '/comments',
  authorController.getMyComments
);

// ==================== Media ====================

router.get(
  '/media',
  authorController.getMedia
);

router.post(
  '/media',
  upload.single('file'),
  authorController.uploadMedia
);

router.delete(
  '/media/:id',
  authorController.deleteMedia
);

// ==================== Analytics ====================

router.get(
  '/analytics',
  authorController.getAnalytics
);

// ==================== Profile ====================

router.get(
  "/profile",
  authorController.getProfile
);

router.put(
  "/profile",
  authorController.updateProfile
);

module.exports = router;