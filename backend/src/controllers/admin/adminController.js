const authService = require('../../services/auth/authService');
const articleService = require('../../services/breaking-news/articleService');
const categoryService = require('../../services/categories/categoryService');
const tagService = require('../../services/tags/tagService');
const commentService = require('../../services/comments/commentService');
const mediaService = require('../../services/media-library/mediaService');
const adService = require('../../services/advertisements/adService');
const videoService = require('../../services/videos/videoService');
const seoService = require('../../services/seo/seoService');
const analyticsService = require('../../services/analytics/analyticsService');
const homepageService = require('../../services/homepage-builder/homepageService');
const path = require('path');

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toBoolean = (value) =>
  value === true || value === 'true' || value === '1' || value === 1;

const normalizeArticlePayload = (body = {}) => {
  const data = { ...body };

  data.tags = parseMaybeJson(data.tags, []);
  if (!Array.isArray(data.tags)) {
    data.tags = data.tags ? [data.tags] : [];
  }

  data.seo = parseMaybeJson(data.seo, data.seo);
  if (data.seo && typeof data.seo !== 'object') {
    delete data.seo;
  }

  if (data.isFeatured !== undefined) data.isFeatured = toBoolean(data.isFeatured);
  if (data.isBreaking !== undefined) data.isBreaking = toBoolean(data.isBreaking);
  if (data.isTrending !== undefined) data.isTrending = toBoolean(data.isTrending);
  if (data.isDontMiss !== undefined) data.isDontMiss = toBoolean(data.isDontMiss);

  return data;
};

// ======================================================
// USERS
// ======================================================

const getUsers = asyncHandler(async (req, res) => {
  const Article = require('../../models/article/Article');
  const {
    shouldIncludeWpUsers,
    isMysqlContentMode,
  } = require('../../config/dbMode');
  const { isMysqlReady } = require('../../config/mysql');

  let mongoUsers = [];
  try {
    mongoUsers = await authService.getAllUsers(req.query);
  } catch (err) {
    // Auth DB optional when listing WP users in mysql mode
    if (!isMysqlReady()) throw err;
    console.warn('Mongo users unavailable:', err.message);
  }

  let countMap = new Map();
  try {
    const counts = await Article.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
    ]);
    countMap = new Map(counts.map((row) => [String(row._id), row.count]));
  } catch {
    /* mongo articles optional */
  }

  const withPostCounts = mongoUsers.map((user) => {
    const obj = typeof user.toObject === 'function' ? user.toObject() : user;
    return {
      ...obj,
      source: 'mongodb',
      articleCount: countMap.get(String(obj._id)) || 0,
      postCount: countMap.get(String(obj._id)) || 0,
    };
  });

  let merged = withPostCounts;

  if (shouldIncludeWpUsers()) {
    const { listWpAuthors } = require('../../services/wordpress/wpUserService');
    // mysql mode: show every WP user; both mode: authors with posts is enough,
    // but includeAll still better for Users screen
    const wpAuthors = await listWpAuthors({
      includeAll: true,
    });

    const byEmail = new Map(
      withPostCounts
        .filter((u) => u.email)
        .map((u) => [String(u.email).toLowerCase(), u])
    );

    const extras = [];
    for (const wpUser of wpAuthors) {
      const emailKey = String(wpUser.email || '').toLowerCase();
      const existing = emailKey ? byEmail.get(emailKey) : null;
      if (existing) {
        existing.postCount =
          Math.max(existing.postCount || 0, 0) + (wpUser.postCount || 0);
        existing.articleCount = existing.postCount;
        existing.wpUserId = wpUser.wpUserId;
        existing.linkedSources = ['mongodb', 'wordpress-mysql'];
        // Prefer showing WordPress source badge when mysql is primary
        if (isMysqlContentMode()) {
          existing.source = 'mongodb+wordpress';
        }
      } else {
        extras.push(wpUser);
      }
    }

    // In mysql mode put WordPress users first (content authors), then Mongo login accounts
    merged = isMysqlContentMode()
      ? [...extras, ...withPostCounts]
      : [...withPostCounts, ...extras];
  }

  // Optional role filter after merge
  if (req.query.role) {
    merged = merged.filter((u) => u.role === req.query.role);
  }

  res.status(200).json(new ApiResponse(200, merged));
});

const createUser = asyncHandler(async (req, res) => {
  const user = await authService.register(
    req.body,
    req.user
  );

  res.status(201).json(
    new ApiResponse(
      201,
      user,
      'User created'
    )
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const id = String(req.params.id || '');
  if (id.startsWith('wp-') || /^\d+$/.test(id)) {
    const { updateWpUser } = require('../../services/wordpress/wpUserService');
    const user = await updateWpUser(id, req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, user, 'WordPress user updated'));
  }

  const user = await authService.updateUser(id, req.body, req.user);

  res.status(200).json(new ApiResponse(200, user, 'User updated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = String(req.params.id || '');
  if (id.startsWith('wp-') || /^\d+$/.test(id)) {
    const { deleteWpUser } = require('../../services/wordpress/wpUserService');
    await deleteWpUser(id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'WordPress user deleted'));
  }

  await authService.deleteUser(id);

  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});


// ======================================================
// ARTICLES
// ======================================================

const getArticles = asyncHandler(async (req, res) => {
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

  res.status(200).json(
    new ApiResponse(200, article)
  );
});

const createArticle = asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const data = normalizeArticlePayload(req.body);

  if (req.file) {
    // Prefer absolute disk path so MySQL/WP image attach can find the file
    data.featuredImage = req.file.path
      ? path.resolve(req.file.path)
      : `/${String(req.file.filename || '').replace(/\\/g, '/')}`;
  }

  console.log("DATA:", data);

  const article = await articleService.createArticle(
    data,
    req.user
  );

  res.status(201).json(
    new ApiResponse(201, article, "Article created")
  );
});

const updateArticle = asyncHandler(async (req, res) => {
  const data = normalizeArticlePayload(req.body);

  if (req.file) {
    // Prefer absolute disk path so MySQL/WP image attach can find the file
    data.featuredImage = req.file.path
      ? path.resolve(req.file.path)
      : `/${String(req.file.filename || '').replace(/\\/g, '/')}`;
  }

  const article =
    await articleService.updateArticle(
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
      "Article deleted"
    )
  );
});

const approveArticle = asyncHandler(async (req, res) => {
  const article =
    await articleService.approveArticle(
      req.params.id,
      req.user
    );

  res.status(200).json(
    new ApiResponse(
      200,
      article,
      "Article approved"
    )
  );
});


// ======================================================
// CATEGORIES
// ======================================================

const getCategories = asyncHandler(async (req, res) => {
  const categories =
    await categoryService.getCategories(false, { tree: true, merge: true });

  res.status(200).json(
    new ApiResponse(200, categories)
  );
});

const createCategory = asyncHandler(async (req, res) => {
  const category =
    await categoryService.createCategory(
      req.body,
      req.user
    );

  res.status(201).json(
    new ApiResponse(201, category)
  );
});

const updateCategory = asyncHandler(async (req, res) => {
  const category =
    await categoryService.updateCategory(
      req.params.id,
      req.body
    );

  res.status(200).json(
    new ApiResponse(200, category)
  );
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Category deleted'
    )
  );
});

const reorderCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.reorderCategories(req.body);
  res
    .status(200)
    .json(new ApiResponse(200, categories, 'Categories reordered'));
});


// ======================================================
// TAGS
// ======================================================

const getTags = asyncHandler(async (req, res) => {
  const tags =
    await tagService.getTags(false, { merge: true });

  res.status(200).json(
    new ApiResponse(200, tags)
  );
});

const createTag = asyncHandler(async (req, res) => {
  const tag =
    await tagService.createTag(
      req.body,
      req.user
    );

  res.status(201).json(
    new ApiResponse(201, tag)
  );
});

const updateTag = asyncHandler(async (req, res) => {
  const tag =
    await tagService.updateTag(
      req.params.id,
      req.body
    );

  res.status(200).json(
    new ApiResponse(200, tag)
  );
});

const deleteTag = asyncHandler(async (req, res) => {
  await tagService.deleteTag(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Tag deleted'
    )
  );
});


// ======================================================
// COMMENTS
// ======================================================

const getComments = asyncHandler(async (req, res) => {
  const result =
    await commentService.getAllComments(
      req.query
    );

  res.status(200).json(
    new ApiResponse(200, result)
  );
});

const moderateComment = asyncHandler(async (req, res) => {
  const comment =
    await commentService.moderateComment(
      req.params.id,
      req.body.status,
      req.user
    );

  res.status(200).json(
    new ApiResponse(
      200,
      comment,
      'Comment moderated'
    )
  );
});

const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Comment deleted'
    )
  );
});


// ======================================================
// MEDIA
// ======================================================

const uploadMedia = asyncHandler(async (req, res) => {
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
});

const getMedia = asyncHandler(async (req, res) => {
  const result =
    await mediaService.getMediaLibrary(
      req.query
    );

  res.status(200).json(
    new ApiResponse(200, result)
  );
});

const deleteMedia = asyncHandler(async (req, res) => {
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
});


// ======================================================
// ADS
// ======================================================

const getAds = asyncHandler(async (req, res) => {
  const ads =
    await adService.getAllAds();

  res.status(200).json(
    new ApiResponse(200, ads)
  );
});

const createAd = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    const media = await mediaService.uploadMedia(req.file, req.user, {
      altText: data.title || 'Advertisement',
      caption: 'Ad creative',
    });
    data.imageUrl = media.url;
  }

  if (!data.imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an ad image',
    });
  }

  const ad = await adService.createAd(data, req.user);

  res.status(201).json(new ApiResponse(201, ad));
});

const updateAd = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    const media = await mediaService.uploadMedia(req.file, req.user, {
      altText: data.title || 'Advertisement',
      caption: 'Ad creative',
    });
    data.imageUrl = media.url;
  }

  const ad = await adService.updateAd(req.params.id, data);

  res.status(200).json(new ApiResponse(200, ad));
});

const deleteAd = asyncHandler(async (req, res) => {
  await adService.deleteAd(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Ad deleted'));
});

const getVideos = asyncHandler(async (req, res) => {
  const videos = await videoService.getAllVideos();
  res.status(200).json(new ApiResponse(200, videos));
});

const createVideo = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const videoFile = req.files?.video?.[0];
  const thumbFile = req.files?.thumbnail?.[0];

  if (!videoFile) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a video file (MP4 or WebM, max 120MB)',
    });
  }

  if (!videoFile.mimetype.startsWith('video/')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid video file type. Use MP4 or WebM.',
    });
  }

  const videoMedia = await mediaService.uploadMedia(videoFile, req.user, {
    altText: data.title || 'Homepage video',
    caption: 'Homepage video file',
  });
  data.videoUrl = videoMedia.url;
  data.mimeType = videoFile.mimetype;
  data.fileSize = videoFile.size;
  data.originalName = videoFile.originalname;

  if (thumbFile) {
    const media = await mediaService.uploadMedia(thumbFile, req.user, {
      altText: data.title || 'Video thumbnail',
      caption: 'Homepage video thumbnail',
    });
    data.thumbnailUrl = media.url;
  }

  const video = await videoService.createVideo(data, req.user);
  res.status(201).json(new ApiResponse(201, video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const videoFile = req.files?.video?.[0];
  const thumbFile = req.files?.thumbnail?.[0];

  if (videoFile) {
    if (!videoFile.mimetype.startsWith('video/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid video file type. Use MP4 or WebM.',
      });
    }
    const videoMedia = await mediaService.uploadMedia(videoFile, req.user, {
      altText: data.title || 'Homepage video',
      caption: 'Homepage video file',
    });
    data.videoUrl = videoMedia.url;
    data.mimeType = videoFile.mimetype;
    data.fileSize = videoFile.size;
    data.originalName = videoFile.originalname;
  }

  if (thumbFile) {
    const media = await mediaService.uploadMedia(thumbFile, req.user, {
      altText: data.title || 'Video thumbnail',
      caption: 'Homepage video thumbnail',
    });
    data.thumbnailUrl = media.url;
  }

  const video = await videoService.updateVideo(req.params.id, data);
  res.status(200).json(new ApiResponse(200, video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  await videoService.deleteVideo(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Video deleted'));
});

// ======================================================
// NEWSLETTER
// ======================================================

const getSubscribers = asyncHandler(async (req, res) => {
  const newsletterService = require('../../services/newsletter/newsletterService');
  const subscribers = await newsletterService.getSubscribers();
  res.status(200).json(new ApiResponse(200, subscribers));
});

const sendNewsletterNow = asyncHandler(async (req, res) => {
  const newsletterService = require('../../services/newsletter/newsletterService');
  const result = await newsletterService.sendDailyDigest();
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Newsletter digest processed'));
});


// ======================================================
// SEO
// ======================================================

const getSeo = asyncHandler(async (req, res) => {
  const seo =
    await seoService.getSiteSeo();

  res.status(200).json(
    new ApiResponse(200, seo)
  );
});

const updateSeo = asyncHandler(async (req, res) => {
  const seo =
    await seoService.updateSiteSeo(
      req.body,
      req.user
    );

  res.status(200).json(
    new ApiResponse(
      200,
      seo,
      'SEO settings updated'
    )
  );
});


// ======================================================
// ANALYTICS
// ======================================================

const getAnalytics = asyncHandler(async (req, res) => {
  const stats =
    await analyticsService.getDashboardStats(
      parseInt(req.query.days, 10) || 30
    );

  res.status(200).json(
    new ApiResponse(200, stats)
  );
});


// ======================================================
// HOMEPAGE
// ======================================================

const getHomepageSections = asyncHandler(async (req, res) => {
  let sections = await homepageService.getHomepageSections(false);

  // Always sync missing default homepage blocks into the builder list
  if (req.query.ensureDefaults !== '0') {
    sections = await homepageService.ensureDefaultSections(req.user);
  }

  res.status(200).json(new ApiResponse(200, sections));
});

const ensureHomepageDefaults = asyncHandler(async (req, res) => {
  const sections = await homepageService.ensureDefaultSections(req.user);
  res
    .status(200)
    .json(new ApiResponse(200, sections, 'Default homepage sections synced'));
});

const createHomepageSection = asyncHandler(async (req, res) => {
  const section =
    await homepageService.createSection(
      req.body,
      req.user
    );

  res.status(201).json(
    new ApiResponse(201, section)
  );
});

const updateHomepageSection = asyncHandler(async (req, res) => {
  const section =
    await homepageService.updateSection(
      req.params.id,
      req.body,
      req.user
    );

  res.status(200).json(
    new ApiResponse(200, section)
  );
});

const deleteHomepageSection = asyncHandler(async (req, res) => {
  await homepageService.deleteSection(
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Section deleted'
    )
  );
});

const reorderHomepageSections = asyncHandler(async (req, res) => {
  const sections =
    await homepageService.reorderSections(
      req.body.orderedIds
    );

  res.status(200).json(
    new ApiResponse(
      200,
      sections,
      'Sections reordered'
    )
  );
});


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  // Users
  getUsers,
  createUser,
  updateUser,
  deleteUser,

  // Articles
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  approveArticle,

  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,

  // Tags
  getTags,
  createTag,
  updateTag,
  deleteTag,

  // Comments
  getComments,
  moderateComment,
  deleteComment,

  // Media
  uploadMedia,
  getMedia,
  deleteMedia,

  // Ads
  getAds,
  createAd,
  updateAd,
  deleteAd,

  // Videos
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,

  // Newsletter
  getSubscribers,
  sendNewsletterNow,

  // SEO
  getSeo,
  updateSeo,

  // Analytics
  getAnalytics,

  // Homepage
  getHomepageSections,
  ensureHomepageDefaults,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSections,
};