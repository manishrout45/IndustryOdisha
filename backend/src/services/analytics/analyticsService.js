const mongoose = require('mongoose');
const AnalyticsEvent = require('../../models/analytics/AnalyticsEvent');
const Article = require('../../models/article/Article');
const Comment = require('../../models/comment/Comment');
const Media = require('../../models/media/Media');
const { ARTICLE_STATUS } = require('../../config/constants');

const trackEvent = async (data) => AnalyticsEvent.create(data);

const toObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(String(id));
  }
  return null;
};

const getDashboardStats = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [pageViews, articleViews, topArticles, recentEvents] = await Promise.all([
    AnalyticsEvent.countDocuments({
      eventType: 'page_view',
      createdAt: { $gte: since },
    }),
    AnalyticsEvent.countDocuments({
      eventType: 'article_view',
      createdAt: { $gte: since },
    }),
    Article.find({ status: ARTICLE_STATUS.PUBLISHED })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('title slug viewCount publishedAt'),
    AnalyticsEvent.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('article', 'title slug'),
  ]);

  return { pageViews, articleViews, topArticles, recentEvents, period: days };
};

/**
 * Author-only analytics — never includes other authors' posts.
 */
const getAuthorStats = async (authorId, days = 30) => {
  const authorObjectId = toObjectId(authorId);
  if (!authorObjectId) {
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      pendingArticles: 0,
      totalViews: 0,
      articleViews: 0,
      publishedCount: 0,
      draftCount: 0,
      topArticles: [],
      monthlyViews: [],
      recentActivity: [],
      comments: 0,
      mediaFiles: 0,
      period: days,
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const authorFilter = { author: authorObjectId };

  const articles = await Article.find(authorFilter)
    .select('_id title slug status viewCount publishedAt createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  const articleIds = articles.map((a) => a._id);

  const [
    totalViewsAgg,
    publishedArticles,
    draftArticles,
    pendingArticles,
    totalArticles,
    articleViews,
    monthlyViewsRaw,
    comments,
    mediaFiles,
  ] = await Promise.all([
    Article.aggregate([
      { $match: authorFilter },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$viewCount', 0] } } } },
    ]),
    Article.countDocuments({
      ...authorFilter,
      status: ARTICLE_STATUS.PUBLISHED,
    }),
    Article.countDocuments({
      ...authorFilter,
      status: ARTICLE_STATUS.DRAFT,
    }),
    Article.countDocuments({
      ...authorFilter,
      status: ARTICLE_STATUS.PENDING,
    }),
    Article.countDocuments(authorFilter),
    articleIds.length
      ? AnalyticsEvent.countDocuments({
          eventType: 'article_view',
          article: { $in: articleIds },
          createdAt: { $gte: since },
        })
      : Promise.resolve(0),
    articleIds.length
      ? AnalyticsEvent.aggregate([
          {
            $match: {
              eventType: 'article_view',
              article: { $in: articleIds },
              createdAt: { $gte: since },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              views: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ])
      : Promise.resolve([]),
    articleIds.length
      ? Comment.countDocuments({ article: { $in: articleIds } })
      : Promise.resolve(0),
    Media.countDocuments({ uploadedBy: authorObjectId }),
  ]);

  const totalViews = totalViewsAgg[0]?.total || 0;

  const topArticles = [...articles]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 10)
    .map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      status: a.status,
      viewCount: a.viewCount || 0,
      views: a.viewCount || 0,
      publishedAt: a.publishedAt,
    }));

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthlyViews = monthlyViewsRaw.map((row) => ({
    month: `${monthNames[(row._id.month || 1) - 1]} ${row._id.year}`,
    views: row.views || 0,
  }));

  // If no event timeline yet, fall back to a single bucket from cumulative views
  if (!monthlyViews.length && totalViews > 0) {
    monthlyViews.push({
      month: 'All time',
      views: totalViews,
    });
  }

  const recentActivity = articles.slice(0, 8).map((a) => ({
    _id: a._id,
    title: a.title,
    status: a.status,
    viewCount: a.viewCount || 0,
    updatedAt: a.updatedAt,
    message: `${a.title} · ${a.status} · ${a.viewCount || 0} views`,
  }));

  return {
    // Dashboard field names
    totalArticles,
    publishedArticles,
    draftArticles,
    pendingArticles,
    totalViews,
    articleViews,
    // Aliases used by older UI
    publishedCount: publishedArticles,
    draftCount: draftArticles,
    // Analytics page
    topArticles,
    monthlyViews,
    recentActivity,
    comments,
    mediaFiles,
    period: days,
  };
};

module.exports = { trackEvent, getDashboardStats, getAuthorStats };
