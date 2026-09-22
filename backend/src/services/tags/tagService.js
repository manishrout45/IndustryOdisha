const Tag = require('../../models/tag/Tag');
const ApiError = require('../../utils/ApiError');
const {
  isMysqlContentMode,
  shouldMergeCmsSources,
} = require('../../config/dbMode');

const wpTagService = () => require('../wordpress/wpTagService');

const getTags = async (activeOnly = true, { merge = false } = {}) => {
  if (isMysqlContentMode()) {
    return wpTagService().getTags(activeOnly);
  }

  if (merge && shouldMergeCmsSources()) {
    const [mongoTags, wpTags] = await Promise.all([
      Tag.find(activeOnly ? { isActive: true } : {}).sort({ name: 1 }),
      wpTagService().getTags(activeOnly),
    ]);

    const bySlug = new Map();
    wpTags.forEach((t) => {
      bySlug.set(String(t.slug).toLowerCase(), {
        ...t,
        _id: String(t._id),
        source: 'wordpress-mysql',
      });
    });
    mongoTags.forEach((t) => {
      const plain = typeof t.toObject === 'function' ? t.toObject() : t;
      const key = String(plain.slug).toLowerCase();
      if (!bySlug.has(key)) {
        bySlug.set(key, { ...plain, source: 'mongodb' });
      }
    });
    return [...bySlug.values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }

  const filter = activeOnly ? { isActive: true } : {};
  return Tag.find(filter).sort({ name: 1 });
};

const getTagBySlug = async (slug) => {
  if (isMysqlContentMode()) {
    return wpTagService().getTagBySlug(slug);
  }

  const tag = await Tag.findOne({ slug, isActive: true });
  if (!tag) throw new ApiError(404, 'Tag not found');
  return tag;
};

const createTag = async (data, user) => {
  return Tag.create({ ...data, createdBy: user._id });
};

const updateTag = async (id, data) => {
  const tag = await Tag.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!tag) throw new ApiError(404, 'Tag not found');
  return tag;
};

const deleteTag = async (id) => {
  const tag = await Tag.findByIdAndDelete(id);
  if (!tag) throw new ApiError(404, 'Tag not found');
  return tag;
};

module.exports = {
  getTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
};
