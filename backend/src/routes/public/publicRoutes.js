const express = require('express');
const publicController = require('../../controllers/public/publicController');
const validate = require('../../middleware/validate');
const { commentValidator } = require('../../validators/contentValidator');
const protect = require('../../middleware/auth/protect');
const shortCache = require('../../middleware/shortCache');

const router = express.Router();
const feedCache = shortCache(45000);

router.get('/homepage', feedCache, publicController.getHomepage);
router.get('/homepage-feeds', feedCache, publicController.getHomepageFeeds);
router.get('/articles', publicController.getArticles);
router.get('/breaking-news', feedCache, publicController.getBreakingNews);
router.get('/trending-news', feedCache, publicController.getTrendingNews);
router.get('/latest-news', feedCache, publicController.getLatestNews);
router.get('/dont-miss', feedCache, publicController.getDontMissNews);
router.get('/featured-news', feedCache, publicController.getFeaturedNews);
router.get('/most-read', feedCache, publicController.getMostReadNews);
router.get('/videos', feedCache, publicController.getVideos);
router.get('/categories', feedCache, publicController.getCategories);
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
