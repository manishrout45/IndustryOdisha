const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  AUTHOR: 'author',
};

const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
};

const AD_POSITIONS = {
  HEADER_TOP: 'header-top',
  HEADER: 'header',
  HOMEPAGE: 'homepage',
  HOMEPAGE_AFTER_HERO: 'homepage-after-hero',
  HOMEPAGE_MID: 'homepage-mid',
  HOMEPAGE_BOTTOM: 'homepage-bottom',
  SIDEBAR: 'sidebar',
  IN_ARTICLE: 'in-article',
  CATEGORY_TOP: 'category-top',
  FOOTER: 'footer',
};

const HOMEPAGE_SECTION_TYPES = {
  HERO: 'hero',
  BREAKING_NEWS: 'breaking-news',
  TRENDING: 'trending',
  DONT_MISS: 'dont-miss',
  LATEST: 'latest',
  MOST_READ: 'most-read',
  CATEGORY_BLOCK: 'category-block',
  VIDEO: 'video',
  MEDIA_GALLERY: 'media-gallery',
  CUSTOM_HTML: 'custom-html',
};

module.exports = {
  ROLES,
  ARTICLE_STATUS,
  COMMENT_STATUS,
  MEDIA_TYPES,
  AD_POSITIONS,
  HOMEPAGE_SECTION_TYPES,
};
