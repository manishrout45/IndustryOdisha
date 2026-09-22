const Article = require('../../models/article/Article');
const ApiError = require('../../utils/ApiError');
const { ARTICLE_STATUS, ROLES } = require('../../config/constants');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const fs = require("fs");
const { cloudinary } = require("../../config/cloudinary");
const {
  isMysqlContentMode,
  shouldMergeCmsSources,
} = require('../../config/dbMode');
const { isMysqlReady } = require('../../config/mysql');

const wpArticleService = () => require('../wordpress/wpArticleService');
const { getMergedArticles } = require('../wordpress/wpCmsMerge');

const articlePopulate = [
  { path: 'author', select: 'name avatar bio role email' },
  { path: 'category', select: 'name slug' },
  { path: 'tags', select: 'name slug' },
];

const buildArticleFilter = (query = {}, user = null) => {
  const filter = {};

if (query.status) {
  filter.status = query.status;
} else if (!user) {
  filter.status = ARTICLE_STATUS.PUBLISHED;
}

  if (query.category) filter.category = query.category;
  // Skip invalid ObjectId when filtering by WordPress author id (wp-123)
  if (query.author && !String(query.author).startsWith('wp-')) {
    filter.author = query.author;
  }
  if (query.date) {

  const start = new Date(query.date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(query.date);
  end.setHours(23, 59, 59, 999);

  filter.createdAt = {
    $gte: start,
    $lte: end,
  };

}
  if (query.isBreaking === 'true') filter.isBreaking = true;
  if (query.isTrending === 'true') filter.isTrending = true;
  if (query.isFeatured === 'true') filter.isFeatured = true;
  if (query.isDontMiss === 'true') filter.isDontMiss = true;
  if (query.tag) filter.tags = query.tag;

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { excerpt: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
};

const getMongoArticles = async (query, user = null) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildArticleFilter(query, user);

  if (user?.role === ROLES.AUTHOR && !query.all) {
    filter.author = user._id;
  }

  // When merging, pull a wide Mongo window then paginate after merge
  const mergeMode = Boolean(user) && shouldMergeCmsSources();
  const mongoLimit = mergeMode ? Math.min(2000, Math.max(limit, 500)) : limit;
  const mongoSkip = mergeMode ? 0 : skip;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .populate(articlePopulate)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(mongoSkip)
      .limit(mongoLimit),
    Article.countDocuments(filter),
  ]);

  return {
    articles,
    meta: buildPaginationMeta(total, page, limit),
  };
};

const getArticles = async (query, user = null) => {
  // DB_TYPE=mysql → WordPress is the live content store (public + CMS)
  if (isMysqlContentMode()) {
    if (user?.role === ROLES.AUTHOR && !query.all) {
      const { findWpUserIdForCmsUser } = require('../wordpress/wpCmsMerge');
      const wpAuthorId = await findWpUserIdForCmsUser(user);
      if (!wpAuthorId) {
        return {
          articles: [],
          meta: buildPaginationMeta(0, 1, parseInt(query.limit, 10) || 10),
        };
      }
      const articles = await wpArticleService().listAllForCms({
        authorId: wpAuthorId,
        search: query.search || '',
        hardLimit: parseInt(query.limit, 10) || 2000,
      });
      const { page, limit } = getPagination(query);
      return {
        articles,
        meta: buildPaginationMeta(articles.length, page, limit),
      };
    }

    // Admin / public listing
    if (user) {
      let authorId = null;
      const authorQ = String(query.author || '');
      if (authorQ.startsWith('wp-') || /^\d+$/.test(authorQ)) {
        authorId = Number(authorQ.replace(/^wp-/i, ''));
      }

      const articles = await wpArticleService().listAllForCms({
        authorId: authorId || null,
        search: query.search || '',
        hardLimit: parseInt(query.limit, 10) || 2000,
      });
      let filtered = articles;
      if (query.category) {
        const catId = String(query.category).replace(/^wp-/i, '');
        filtered = articles.filter(
          (a) => String(a.category?._id || '') === String(catId)
        );
      }
      if (query.status && query.status !== 'all') {
        filtered = filtered.filter((a) => a.status === query.status);
      }
      if (query.date) {
        const start = new Date(query.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(query.date);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter((a) => {
          const t = new Date(a.publishedAt || a.createdAt || 0).getTime();
          return t >= start.getTime() && t <= end.getTime();
        });
      }
      const { page, limit } = getPagination(query);
      const startIdx = (page - 1) * limit;
      return {
        articles: filtered.slice(startIdx, startIdx + limit),
        meta: buildPaginationMeta(filtered.length, page, limit),
      };
    }

    return wpArticleService().getArticles(query);
  }

  // Admin / author CMS merge when both DBs connected but content not mysql-primary
  if (user && shouldMergeCmsSources()) {
    const mongoQuery = { ...query };
    if (String(query.author || '').startsWith('wp-')) {
      delete mongoQuery.author;
      return getMergedArticles(
        async () => ({ articles: [], meta: buildPaginationMeta(0, 1, 10) }),
        query,
        user
      );
    }
    return getMergedArticles(() => getMongoArticles(mongoQuery, user), query, user);
  }

  return getMongoArticles(query, user);
};

const getArticleBySlug = async (slug, incrementView = false) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getArticleBySlug(slug);
  }

  let article;

  if (incrementView) {
    article = await Article.findOneAndUpdate(
      { slug, status: ARTICLE_STATUS.PUBLISHED },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate(articlePopulate);
  } else {
    article = await Article.findOne({
      slug,
      status: ARTICLE_STATUS.PUBLISHED,
    }).populate(articlePopulate);
  }

  if (!article) throw new ApiError(404, 'Article not found');
  return article;
};

const isLikelyWpId = (id) => /^\d+$/.test(String(id || ''));

const getArticleById = async (id) => {
  if (isMysqlContentMode() || (isMysqlReady() && isLikelyWpId(id))) {
    try {
      const wpArticle = await wpArticleService().getArticleById(id);
      return { ...wpArticle, source: 'wordpress-mysql', readOnly: false };
    } catch (err) {
      if (isMysqlContentMode()) throw err;
      if (!err.statusCode || err.statusCode !== 404) throw err;
    }
  }

  const article = await Article.findById(id).populate(articlePopulate);
  if (!article) throw new ApiError(404, 'Article not found');
  return article;
};

const createArticle = async (data, author) => {
  if (isMysqlContentMode()) {
    const wpWrite = require('../wordpress/wpArticleWrite');
    return wpWrite.createArticle(data, author);
  }

  if (
    data.featuredImage &&
    !data.featuredImage.startsWith("http")
  ) {

    const localPath = data.featuredImage.replace(/^\//, "");

    const result = await cloudinary.uploader.upload(localPath, {
      folder: "news-portal/articles",
    });

    data.featuredImage = result.secure_url;

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  return await Article.create({
    ...data,
    author: author._id,
  });
};

const updateArticle = async (id, data, user) => {
  if (isMysqlContentMode() || (isMysqlReady() && isLikelyWpId(id))) {
    const wpWrite = require('../wordpress/wpArticleWrite');
    return wpWrite.updateArticle(id, data, user);
  }

  const article = await Article.findById(id);

  if (!article)
    throw new ApiError(404, "Article not found");

  if (
    user.role === ROLES.AUTHOR &&
    article.author.toString() !== user._id.toString()
  ) {
    throw new ApiError(
      403,
      "You can only edit your own articles"
    );
  }

  if (
    user.role === ROLES.AUTHOR &&
    data.status === ARTICLE_STATUS.PUBLISHED
  ) {
    data.status = ARTICLE_STATUS.PENDING;
  }

  if (
    data.featuredImage &&
    !data.featuredImage.startsWith("http")
  ) {

    const localPath = data.featuredImage.replace(/^\//, "");

    const result = await cloudinary.uploader.upload(localPath, {
      folder: "news-portal/articles",
    });

    data.featuredImage = result.secure_url;

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  Object.assign(article, data);

  await article.save();

  return article.populate(articlePopulate);
};

const deleteArticle = async (id, user) => {
  if (isMysqlContentMode() || (isMysqlReady() && isLikelyWpId(id))) {
    const wpWrite = require('../wordpress/wpArticleWrite');
    return wpWrite.deleteArticle(id);
  }

  const article = await Article.findById(id);
  if (!article) throw new ApiError(404, 'Article not found');

  if (user.role === ROLES.AUTHOR && article.author.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own articles');
  }

  await article.deleteOne();
  return article;
};

const approveArticle = async (id, approver) => {
  if (isMysqlContentMode() || (isMysqlReady() && isLikelyWpId(id))) {
    const wpWrite = require('../wordpress/wpArticleWrite');
    return wpWrite.approveArticle(id);
  }

  const article = await Article.findById(id);
  if (!article) throw new ApiError(404, 'Article not found');

  article.status = ARTICLE_STATUS.PUBLISHED;
  article.approvedBy = approver._id;
  if (!article.publishedAt) article.publishedAt = new Date();
  await article.save();

  return article.populate(articlePopulate);
};

const getBreakingNews = async (limit = 5) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getBreakingNews(limit);
  }

  return Article.find({ status: ARTICLE_STATUS.PUBLISHED, isBreaking: true })
    .populate(articlePopulate)
    .sort({ publishedAt: -1 })
    .limit(limit);
};

const getTrendingNews = async (limit = 5) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getTrendingNews(limit);
  }

  return Article.find({
    status: ARTICLE_STATUS.PUBLISHED,
    isTrending: true,
  })
    .populate(articlePopulate)
    .sort({ viewCount: -1, publishedAt: -1 })
    .limit(limit);
};

const getDontMissNews = async (limit = 6) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getDontMissNews(limit);
  }

  return Article.find({
    status: ARTICLE_STATUS.PUBLISHED,
    isDontMiss: true,
  })
    .populate(articlePopulate)
    .sort({ publishedAt: -1 })
    .limit(limit);
};

const getFeaturedNews = async (limit = 6) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getFeaturedNews(limit);
  }

  return Article.find({
    status: ARTICLE_STATUS.PUBLISHED,
    isFeatured: true,
  })
    .populate(articlePopulate)
    .sort({ publishedAt: -1 })
    .limit(limit);
};

const getLatestNews = async (limit = 10) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getLatestNews(limit);
  }

  return Article.find({ status: ARTICLE_STATUS.PUBLISHED })
    .populate(articlePopulate)
    .sort({ publishedAt: -1 })
    .limit(limit);
};

const getMostReadNews = async (limit = 5) => {
  if (isMysqlContentMode()) {
    return wpArticleService().getMostReadNews(limit);
  }

  return Article.find({ status: ARTICLE_STATUS.PUBLISHED })
    .populate(articlePopulate)
    .sort({ viewCount: -1, publishedAt: -1 })
    .limit(limit);
};

module.exports = {
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  approveArticle,
  getBreakingNews,
  getTrendingNews,
  getDontMissNews,
  getFeaturedNews,
  getLatestNews,
  getMostReadNews,
};
