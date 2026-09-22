const express = require('express');
const publicController = require('../../controllers/public/publicController');
const validate = require('../../middleware/validate');
const { commentValidator } = require('../../validators/contentValidator');
const protect = require('../../middleware/auth/protect');

const router = express.Router();

router.get('/homepage', publicController.getHomepage);
router.get('/articles', publicController.getArticles);
router.get('/breaking-news', publicController.getBreakingNews);
router.get('/trending-news', publicController.getTrendingNews);
router.get('/latest-news', publicController.getLatestNews);
router.get('/dont-miss', publicController.getDontMissNews);
router.get('/featured-news', publicController.getFeaturedNews);
router.get('/most-read', publicController.getMostReadNews);
router.get('/videos', publicController.getVideos);
router.get('/categories', publicController.getCategories);
router.get('/categories/:slug', publicController.getCategory);
router.get('/tags', publicController.getTags);
router.get('/tags/:slug', publicController.getTag);
router.get('/comments/article/:articleId', publicController.getComments);
router.get('/articles/:slug', publicController.getArticle);
router.post('/comments', commentValidator, validate, publicController.postComment);
router.get("/media", publicController.getMedia);
router.get('/ads', publicController.getAds);
router.post('/ads/:id/click', publicController.clickAd);
router.get('/seo', publicController.getSeo);
router.post('/newsletter/subscribe', publicController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', publicController.unsubscribeNewsletter);

module.exports = router;
