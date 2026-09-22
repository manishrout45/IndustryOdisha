const HomepageSection = require('../../models/homepage/HomepageSection');
const ApiError = require('../../utils/ApiError');
const articleService = require('../breaking-news/articleService');
const { HOMEPAGE_SECTION_TYPES } = require('../../config/constants');
const { isMongoReady } = require('../../config/mongo');

/** Matches the live public homepage blocks. */
const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    title: 'Breaking News',
    type: HOMEPAGE_SECTION_TYPES.BREAKING_NEWS,
    order: 0,
    config: { limit: 8, showTitle: true },
  },
  {
    title: 'Top News / Featured',
    type: HOMEPAGE_SECTION_TYPES.HERO,
    order: 1,
    config: { limit: 6, showTitle: true },
  },
  {
    title: 'Latest News',
    type: HOMEPAGE_SECTION_TYPES.LATEST,
    order: 2,
    config: { limit: 8, showTitle: true },
  },
  {
    title: "Don't Miss",
    type: HOMEPAGE_SECTION_TYPES.DONT_MISS,
    order: 3,
    config: { limit: 4, showTitle: true },
  },
  {
    title: 'Trending',
    type: HOMEPAGE_SECTION_TYPES.TRENDING,
    order: 4,
    config: { limit: 5, showTitle: true },
  },
  {
    title: 'Most Read',
    type: HOMEPAGE_SECTION_TYPES.MOST_READ,
    order: 5,
    config: { limit: 5, showTitle: true },
  },
  {
    title: 'Category Sections',
    type: HOMEPAGE_SECTION_TYPES.CATEGORY_BLOCK,
    order: 6,
    config: { limit: 6, showTitle: true },
  },
  {
    title: 'Videos',
    type: HOMEPAGE_SECTION_TYPES.VIDEO,
    order: 7,
    config: { limit: 6, showTitle: true },
  },
  {
    title: 'Media Gallery',
    type: HOMEPAGE_SECTION_TYPES.MEDIA_GALLERY,
    order: 8,
    config: { limit: 8, showTitle: true },
  },
];

const getHomepageSections = async (activeOnly = true) => {
  if (!isMongoReady()) return [];
  const filter = activeOnly ? { isActive: true } : {};
  return HomepageSection.find(filter).sort({ order: 1 });
};

/**
 * Creates any missing default homepage sections (by type) so the admin
 * drag-and-drop list matches the public homepage. Does not recreate
 * types the editor already deleted.
 */
const ensureDefaultSections = async (user = null) => {
  if (!isMongoReady()) {
    throw new ApiError(
      503,
      'MongoDB is required to manage homepage sections. Check MONGODB_URI.'
    );
  }

  const existing = await HomepageSection.find({}).select('type order').lean();
  const existingTypes = new Set(existing.map((s) => s.type));

  const lastOrder =
    existing.length > 0
      ? Math.max(...existing.map((s) => s.order ?? 0))
      : -1;

  const toCreate = [];
  let nextOrder = lastOrder + 1;

  for (const def of DEFAULT_HOMEPAGE_SECTIONS) {
    if (existingTypes.has(def.type)) continue;
    toCreate.push({
      ...def,
      order: existing.length === 0 ? def.order : nextOrder++,
      isActive: true,
      updatedBy: user?._id,
    });
  }

  if (toCreate.length) {
    await HomepageSection.insertMany(toCreate);
  }

  return getHomepageSections(false);
};

const populateSectionArticles = async (section) => {
  const data =
    typeof section.toObject === 'function' ? section.toObject() : { ...section };
  const limit = Number(data.config?.limit) || 6;
  data.articles = [];

  try {
    if (data.type === 'breaking-news') {
      data.articles = await articleService.getBreakingNews(limit);
    } else if (data.type === 'trending') {
      data.articles = await articleService.getTrendingNews(limit);
    } else if (data.type === 'latest') {
      data.articles = await articleService.getLatestNews(limit);
    } else if (data.type === 'dont-miss') {
      data.articles = await articleService.getDontMissNews(limit);
    } else if (data.type === 'hero') {
      data.articles = await articleService.getFeaturedNews(limit);
    } else if (data.type === 'most-read') {
      data.articles = await articleService.getMostReadNews(limit);
    } else if (data.type === 'category-block' && data.config?.categoryId) {
      const result = await articleService.getArticles({
        category: String(data.config.categoryId).replace(/^wp-/i, ''),
        limit,
      });
      data.articles = result.articles || [];
    } else if (data.config?.articleIds?.length) {
      const ids = data.config.articleIds.map(String).filter(Boolean);
      const numeric = ids.filter((id) => /^\d+$/.test(id));
      if (numeric.length && articleService.getArticleById) {
        const rows = await Promise.all(
          numeric.map((id) =>
            articleService.getArticleById(id).catch(() => null)
          )
        );
        data.articles = rows.filter(Boolean);
      } else {
        const Article = require('../../models/article/Article');
        data.articles = await Article.find({ _id: { $in: ids } })
          .populate('author', 'name avatar')
          .populate('category', 'name slug');
      }
    }
  } catch (err) {
    console.warn(`Homepage section ${data.type} populate failed:`, err.message);
  }

  return data;
};

const synthesizeDefaultPublicSections = async () =>
  Promise.all(
    DEFAULT_HOMEPAGE_SECTIONS.map((section) =>
      populateSectionArticles({
        _id: `default-${section.type}`,
        title: section.title,
        type: section.type,
        order: section.order,
        isActive: true,
        config: { ...section.config },
      })
    )
  );

const getPublicHomepage = async () => {
  // Prefer editable Mongo CMS sections (works with MySQL article content too)
  if (isMongoReady()) {
    let sections = await getHomepageSections(true);

    if (!sections.length) {
      try {
        await ensureDefaultSections(null);
        sections = await getHomepageSections(true);
      } catch {
        /* fall through to defaults */
      }
    }

    if (sections.length) {
      return Promise.all(sections.map((s) => populateSectionArticles(s)));
    }
  }

  return synthesizeDefaultPublicSections();
};

const createSection = async (data, user) => {
  if (!isMongoReady()) {
    throw new ApiError(503, 'MongoDB is required to manage homepage sections');
  }

  let order = data.order;
  if (order === undefined || order === null) {
    const last = await HomepageSection.findOne()
      .sort({ order: -1 })
      .select('order')
      .lean();
    order = (last?.order ?? -1) + 1;
  }

  const payload = {
    title: data.title,
    type: data.type,
    order,
    isActive: data.isActive !== false,
    config: {
      limit: Number(data.config?.limit) || 6,
      showTitle: data.config?.showTitle !== false,
      customHtml: data.config?.customHtml || '',
      categoryId: data.config?.categoryId
        ? String(data.config.categoryId)
        : null,
      articleIds: Array.isArray(data.config?.articleIds)
        ? data.config.articleIds.map(String)
        : [],
    },
    updatedBy: user?._id,
  };

  return HomepageSection.create(payload);
};

const updateSection = async (id, data, user) => {
  if (!isMongoReady()) {
    throw new ApiError(503, 'MongoDB is required to manage homepage sections');
  }

  const section = await HomepageSection.findById(id);
  if (!section) throw new ApiError(404, 'Homepage section not found');

  if (data.title !== undefined) section.title = data.title;
  if (data.type !== undefined) section.type = data.type;
  if (data.order !== undefined) section.order = data.order;
  if (data.isActive !== undefined) {
    section.isActive =
      data.isActive === true ||
      data.isActive === 'true' ||
      data.isActive === 1;
  }

  if (data.config && typeof data.config === 'object') {
    const next = {
      ...(section.config?.toObject?.() || section.config || {}),
    };
    if (data.config.limit !== undefined) {
      next.limit = Number(data.config.limit) || 6;
    }
    if (data.config.showTitle !== undefined) {
      next.showTitle =
        data.config.showTitle === true ||
        data.config.showTitle === 'true' ||
        data.config.showTitle === 1;
    }
    if (data.config.customHtml !== undefined) {
      next.customHtml = String(data.config.customHtml || '');
    }
    if (data.config.categoryId !== undefined) {
      next.categoryId = data.config.categoryId
        ? String(data.config.categoryId)
        : null;
    }
    if (data.config.articleIds !== undefined) {
      next.articleIds = Array.isArray(data.config.articleIds)
        ? data.config.articleIds.map(String)
        : [];
    }
    section.config = next;
    section.markModified('config');
  }

  section.updatedBy = user?._id;
  await section.save();
  return section;
};

const deleteSection = async (id) => {
  if (!isMongoReady()) {
    throw new ApiError(503, 'MongoDB is required to manage homepage sections');
  }
  const section = await HomepageSection.findByIdAndDelete(id);
  if (!section) throw new ApiError(404, 'Homepage section not found');
  return section;
};

const reorderSections = async (orderedIds) => {
  if (!isMongoReady()) {
    throw new ApiError(503, 'MongoDB is required to manage homepage sections');
  }
  const updates = orderedIds.map((id, index) =>
    HomepageSection.findByIdAndUpdate(id, { order: index })
  );
  await Promise.all(updates);
  return getHomepageSections(false);
};

module.exports = {
  DEFAULT_HOMEPAGE_SECTIONS,
  getHomepageSections,
  ensureDefaultSections,
  getPublicHomepage,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
};
