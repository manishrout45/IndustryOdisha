// src/controllers/author/authorController.js

const articleService = require('../../services/breaking-news/articleService');
const commentService = require('../../services/comments/commentService');
const mediaService = require('../../services/media-library/mediaService');
const analyticsService = require('../../services/analytics/analyticsService');
const categoryService = require('../../services/categories/categoryService');

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const toBoolean = (value) =>
  value === true || value === 'true' || value === '1' || value === 1;

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeArticlePayload = (body = {}) => {
  const data = { ...body };
  data.tags = parseMaybeJson(data.tags, []);
  if (!Array.isArray(data.tags)) {
    data.tags = data.tags ? [data.tags] : [];
  }
  if (data.isFeatured !== undefined) data.isFeatured = toBoolean(data.isFeatured);
  if (data.isBreaking !== undefined) data.isBreaking = toBoolean(data.isBreaking);
  if (data.isTrending !== undefined) data.isTrending = toBoolean(data.isTrending);
  if (data.isDontMiss !== undefined) data.isDontMiss = toBoolean(data.isDontMiss);
  return data;
};

/* =========================
   ARTICLES
========================= */

const getMyArticles = asyncHandler(async (req, res) => {
  const result = await articleService.getArticles(
    req.query,
    req.user
  );

  res.status(200).json(
    new ApiResponse(200, result)
  );
});

const getArticle = asyncHandler(async (req, res) => {
  const article = await articleService.getArticleById(
    req.params.id
  );

  if (
    article.author._id.toString() !==
    req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.status(200).json(
    new ApiResponse(200, article)
  );
});

const createArticle = asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const data = normalizeArticlePayload(req.body);

  if (req.file) {
    const media = await mediaService.uploadMedia(
      req.file,
      req.user,
      {}
    );

    data.featuredImage = media.url;
  }

  const article = await articleService.createArticle(
    data,
    req.user
  );

  res.status(201).json(
    new ApiResponse(
      201,
      article,
      "Article created"
    )
  );
});

const updateArticle = asyncHandler(async (req, res) => {
  const data = normalizeArticlePayload(req.body);

  if (req.file) {
    const media = await mediaService.uploadMedia(
      req.file,
      req.user,
      {}
    );

    data.featuredImage = media.url;
  }

  const article = await articleService.updateArticle(
    req.params.id,
    data,
    req.user
  );

  res.status(200).json(
    new ApiResponse(
      200,
      article,
      "Article updated"
    )
  );
});

const deleteArticle = asyncHandler(async (req, res) => {
  await articleService.deleteArticle(
    req.params.id,
    req.user
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Article deleted'
    )
  );
});

/* =========================
   CATEGORIES
========================= */

const getCategories = asyncHandler(async (req, res) => {
  const categories =
    await categoryService.getCategories(true, { tree: true, merge: true });

  res.status(200).json(
    new ApiResponse(200, categories)
  );
});

/* =========================
   COMMENTS
========================= */

const getMyComments = asyncHandler(async (req, res) => {
  const result =
    await commentService.getAllComments({
      ...req.query,
      author: req.user._id,
    });

  res.status(200).json(
    new ApiResponse(200, result)
  );
});

/* =========================
   MEDIA
========================= */

const uploadMedia = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const media =
      await mediaService.uploadMedia(
        req.file,
        req.user,
        req.body
      );

    res.status(201).json(
      new ApiResponse(
        201,
        media,
        'Media uploaded'
      )
    );
  }
);

const getMedia = asyncHandler(async (req, res) => {
  const result =
    await mediaService.getMediaLibrary(
      req.query,
      req.user
    );

  res.status(200).json(
    new ApiResponse(200, result)
  );
});

const deleteMedia = asyncHandler(
  async (req, res) => {
    await mediaService.deleteMedia(
      req.params.id,
      req.user
    );

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        'Media deleted'
      )
    );
  }
);

/* =========================
   ANALYTICS
========================= */

const getAnalytics = asyncHandler(
  async (req, res) => {
    const stats =
      await analyticsService.getAuthorStats(
        req.user._id,
        parseInt(req.query.days, 10) || 30
      );

    res.status(200).json(
      new ApiResponse(200, stats)
    );
  }
);

/* =========================
   PROFILE
========================= */

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      req.user,
      "Profile fetched successfully"
    )
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  // Replace this later with actual update logic.
  Object.assign(req.user, req.body);

  if (typeof req.user.save === "function") {
    await req.user.save();
  }

  res.status(200).json(
    new ApiResponse(
      200,
      req.user,
      "Profile updated successfully"
    )
  );
});

module.exports = {
  // Articles
  getMyArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,

  // Categories
  getCategories,

  // Comments
  getMyComments,

  // Media
  uploadMedia,
  getMedia,
  deleteMedia,

  // Analytics
  getAnalytics,

  // Profile
  getProfile,
  updateProfile,
};