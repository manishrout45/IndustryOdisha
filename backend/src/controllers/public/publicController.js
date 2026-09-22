const articleService = require('../../services/breaking-news/articleService');
const categoryService = require('../../services/categories/categoryService');
const tagService = require('../../services/tags/tagService');
const commentService = require('../../services/comments/commentService');
const adService = require('../../services/advertisements/adService');
const homepageService = require('../../services/homepage-builder/homepageService');
const seoService = require('../../services/seo/seoService');
const analyticsService = require('../../services/analytics/analyticsService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const mediaService = require('../../services/media-library/mediaService');
const videoService = require('../../services/videos/videoService');

const getHomepage = asyncHandler(async (req, res) => {
  const sections = await homepageService.getPublicHomepage();
  res.status(200).json(new ApiResponse(200, sections));
});

const getArticles = asyncHandler(async (req, res) => {
  const result = await articleService.getArticles(req.query);
  res.status(200).json(new ApiResponse(200, result));
});

const getArticle = asyncHandler(async (req, res) => {
  const trackParam = String(req.query.track ?? '1').toLowerCase();
  const shouldTrack = !(trackParam === '0' || trackParam === 'false');

  const article = await articleService.getArticleBySlug(
    req.params.slug,
    shouldTrack
  );

  const { isMysqlContentMode } = require('../../config/dbMode');
  if (shouldTrack && !isMysqlContentMode()) {
    await analyticsService.trackEvent({
      eventType: 'article_view',
      article: article._id,
      metadata: {
        path: req.originalUrl,
        referrer: req.get('referer'),
        userAgent: req.get('user-agent'),
        ip: req.ip,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, article));
});

const getBreakingNews = asyncHandler(async (req, res) => {
  const articles = await articleService.getBreakingNews(
    parseInt(req.query.limit, 10) || 5
  );
  res.status(200).json(new ApiResponse(200, articles));
});

const getTrendingNews = asyncHandler(async (req, res) => {
  const articles = await articleService.getTrendingNews(
    parseInt(req.query.limit, 10) || 5
  );
  res.status(200).json(new ApiResponse(200, articles));
});

const getLatestNews = asyncHandler(async (req, res) => {
  const articles = await articleService.getLatestNews(
    parseInt(req.query.limit, 10) || 10
  );
  res.status(200).json(new ApiResponse(200, articles));
});

const getDontMissNews = asyncHandler(async (req, res) => {
  const articles = await articleService.getDontMissNews(
    parseInt(req.query.limit, 10) || 6
  );
  res.status(200).json(new ApiResponse(200, articles));
});

const getFeaturedNews = asyncHandler(async (req, res) => {
  const articles = await articleService.getFeaturedNews(
    parseInt(req.query.limit, 10) || 6
  );
  res.status(200).json(new ApiResponse(200, articles));
});

const getMostReadNews = asyncHandler(async (req, res) => {
  const articles = await articleService.getMostReadNews(
    parseInt(req.query.limit, 10) || 5
  );
  res.status(200).json(new ApiResponse(200, articles));
});

const getVideos = asyncHandler(async (req, res) => {
  const { isMysqlContentMode } = require('../../config/dbMode');
  if (isMysqlContentMode()) {
    return res.status(200).json(new ApiResponse(200, []));
  }

  const videos = await videoService.getActiveVideos(
    parseInt(req.query.limit, 10) || 6
  );
  res.status(200).json(new ApiResponse(200, videos));
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(true, { tree: true });
  res.status(200).json(new ApiResponse(200, categories));
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res.status(200).json(new ApiResponse(200, category));
});

const getTags = asyncHandler(async (req, res) => {
  const tags = await tagService.getTags(true);
  res.status(200).json(new ApiResponse(200, tags));
});

const getTag = asyncHandler(async (req, res) => {
  const tag = await tagService.getTagBySlug(req.params.slug);
  res.status(200).json(new ApiResponse(200, tag));
});

const getComments = asyncHandler(async (req, res) => {
  const result = await commentService.getArticleComments(req.params.articleId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

const postComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment({
    ...req.body,
    author: req.user?._id,
  });
  res.status(201).json(new ApiResponse(201, comment, 'Comment submitted for moderation'));
});

const getAds = asyncHandler(async (req, res) => {
  const { isMysqlContentMode } = require('../../config/dbMode');
  if (isMysqlContentMode()) {
    return res.status(200).json(new ApiResponse(200, []));
  }

  const ads = await adService.getActiveAds(req.query.position);
  res.status(200).json(new ApiResponse(200, ads));
});

const clickAd = asyncHandler(async (req, res) => {
  await adService.trackAdClick(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Click tracked'));
});

const getSeo = asyncHandler(async (req, res) => {
  const { isMysqlContentMode } = require('../../config/dbMode');
  if (isMysqlContentMode()) {
    return res.status(200).json(
      new ApiResponse(200, {
        siteName: 'Industry Odisha',
        siteDescription:
          'Business News, Industrial Updates & Economy Insights from Odisha',
        defaultMetaTitle: 'Industry Odisha',
        defaultMetaDescription:
          'Business News, Industrial Updates & Economy Insights from Odisha',
        source: 'wordpress-mysql',
      })
    );
  }

  const seo = await seoService.getSiteSeo();
  res.status(200).json(new ApiResponse(200, seo));
});

const getMedia = asyncHandler(async (req, res) => {
  const { isMysqlContentMode } = require('../../config/dbMode');
  if (isMysqlContentMode()) {
    return res.status(200).json(
      new ApiResponse(200, { media: [], meta: { total: 0 } }, 'Media fetched successfully')
    );
  }

  const result = await mediaService.getMediaLibrary(req.query);

  res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Media fetched successfully"
    )
  );
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { isMysqlContentMode } = require('../../config/dbMode');
  if (isMysqlContentMode()) {
    return res.status(503).json(
      new ApiResponse(
        503,
        null,
        'Newsletter is unavailable while DB_TYPE=mysql. Switch to mongodb for CMS features.'
      )
    );
  }

  const newsletterService = require('../../services/newsletter/newsletterService');
  const subscriber = await newsletterService.subscribe(req.body.email);
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { email: subscriber.email },
        'Subscribed successfully. You’ll get daily top & trending news.'
      )
    );
});

const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const newsletterService = require('../../services/newsletter/newsletterService');
  await newsletterService.unsubscribe(req.body.email);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Unsubscribed successfully'));
});

module.exports = {
  getHomepage,
  getArticles,
  getArticle,
  getBreakingNews,
  getTrendingNews,
  getLatestNews,
  getDontMissNews,
  getFeaturedNews,
  getMostReadNews,
  getVideos,
  getCategories,
  getCategory,
  getTags,
  getTag,
  getComments,
  postComment,
  getAds,
  clickAd,
  getSeo,
  getMedia,
  subscribeNewsletter,
  unsubscribeNewsletter,
};