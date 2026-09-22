const stripHtml = (html = '', max = 300) => {
  const text = String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

const mapWpPostToArticle = (row, extras = {}) => {
  const id = String(row.ID);
  const categories = extras.categories || [];
  const tags = extras.tags || [];
  const author = extras.author || {
    _id: String(row.post_author || '0'),
    name: 'Industry Odisha',
    email: '',
    avatar: '',
    bio: '',
    role: 'author',
  };

  const excerpt =
    (row.post_excerpt && String(row.post_excerpt).trim()) ||
    stripHtml(row.post_content, 280);

  return {
    _id: id,
    id,
    wpPostId: Number(row.ID),
    title: row.post_title || 'Untitled',
    slug: row.post_name || id,
    excerpt,
    content: row.post_content || '',
    featuredImage: extras.featuredImage || '',
    author,
    category: categories[0] || null,
    tags,
    status: row.post_status === 'publish' ? 'published' : row.post_status,
    isBreaking: Boolean(extras.isBreaking),
    isTrending: Boolean(extras.isTrending),
    isFeatured: Boolean(extras.isFeatured),
    isDontMiss: Boolean(extras.isDontMiss),
    publishedAt: row.post_date_gmt || row.post_date,
    createdAt: row.post_date_gmt || row.post_date,
    updatedAt: row.post_modified_gmt || row.post_modified,
    viewCount: Number(extras.viewCount || 0),
    seo: extras.seo || {},
    source: 'wordpress-mysql',
  };
};

module.exports = {
  stripHtml,
  mapWpPostToArticle,
};
