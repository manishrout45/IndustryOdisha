const Category = require('../../models/category/Category');
const ApiError = require('../../utils/ApiError');
const {
  isMysqlContentMode,
  shouldMergeCmsSources,
} = require('../../config/dbMode');

const wpCategoryService = () => require('../wordpress/wpCategoryService');

const toId = (value) => (value ? String(value) : null);

const toPlain = (cat) =>
  typeof cat?.toObject === 'function' ? cat.toObject() : { ...cat };

const buildTree = (categories = []) => {
  const nodes = new Map();
  categories.forEach((cat) => {
    const plain = toPlain(cat);
    nodes.set(String(plain._id), { ...plain, children: [] });
  });

  const roots = [];
  nodes.forEach((node) => {
    const parentId = toId(node.parent);
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId).children.push(node);
    } else if (!parentId) {
      roots.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (list) => {
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    list.forEach((n) => sortNodes(n.children || []));
  };
  sortNodes(roots);
  return roots;
};

const flatten = (nodes = [], acc = []) => {
  nodes.forEach((n) => {
    acc.push(n);
    if (n.children?.length) flatten(n.children, acc);
  });
  return acc;
};

const getMongoCategories = async (activeOnly = true) => {
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ order: 1, name: 1 });
};

const getCategories = async (
  activeOnly = true,
  { tree = true, merge = false } = {}
) => {
  // When MySQL is the live content store, categories come only from WordPress (no duplicates)
  if (isMysqlContentMode()) {
    return wpCategoryService().getCategories(activeOnly, { tree });
  }

  // Optional merge only when DB_TYPE=both
  if (merge && shouldMergeCmsSources()) {
    const [mongoCats, wpTree] = await Promise.all([
      getMongoCategories(activeOnly),
      wpCategoryService().getCategories(activeOnly, { tree: true }),
    ]);

    const mongoPlain = mongoCats.map((c) => ({
      ...toPlain(c),
      source: 'mongodb',
    }));
    const wpFlat = flatten(wpTree).map((c) => ({
      ...c,
      source: 'wordpress-mysql',
      _id: String(c._id),
      wpTermId: String(c._id),
    }));

    // Dedupe by slug — prefer WordPress
    const bySlug = new Map();
    [...wpFlat, ...mongoPlain].forEach((c) => {
      const key = String(c.slug || c.name || c._id).toLowerCase();
      if (!bySlug.has(key)) bySlug.set(key, c);
    });

    const combined = [...bySlug.values()];
    if (!tree) return combined;
    return combined
      .map((c) => ({ ...c, parent: null, children: [] }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  const categories = await getMongoCategories(activeOnly);
  if (!tree) return categories;
  return buildTree(categories);
};

const getCategoryBySlug = async (slug) => {
  if (isMysqlContentMode()) {
    return wpCategoryService().getCategoryBySlug(slug);
  }

  const category = await Category.findOne({ slug, isActive: true });
  if (!category) throw new ApiError(404, 'Category not found');

  const children = await Category.find({
    parent: category._id,
    isActive: true,
  }).sort({ order: 1, name: 1 });

  const plain = category.toObject();
  plain.children = children;
  return plain;
};

const createCategory = async (data, user) => {
  if (isMysqlContentMode()) {
    return wpCategoryService().createCategory(data);
  }

  const payload = { ...data, createdBy: user._id };

  if (payload.parent === '' || payload.parent === undefined) {
    payload.parent = null;
  }

  if (payload.order === undefined || payload.order === null || payload.order === '') {
    const siblingFilter = payload.parent
      ? { parent: payload.parent }
      : { $or: [{ parent: null }, { parent: { $exists: false } }] };
    const last = await Category.findOne(siblingFilter).sort({ order: -1 }).select('order');
    payload.order = (last?.order || 0) + 1;
  }

  if (typeof payload.isActive === 'string') {
    payload.isActive = payload.isActive === 'true' || payload.isActive === '1';
  }

  return Category.create(payload);
};

const updateCategory = async (id, data) => {
  if (isMysqlContentMode() || /^\d+$/.test(String(id || ''))) {
    try {
      return await wpCategoryService().updateCategory(id, data);
    } catch (err) {
      if (isMysqlContentMode()) throw err;
      if (!err.statusCode || err.statusCode !== 404) throw err;
    }
  }

  const payload = { ...data };
  if (payload.parent === '') payload.parent = null;
  if (typeof payload.isActive === 'string') {
    payload.isActive = payload.isActive === 'true' || payload.isActive === '1';
  }
  if (payload.order !== undefined) payload.order = Number(payload.order);

  const category = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
};

const deleteCategory = async (id) => {
  if (isMysqlContentMode() || /^\d+$/.test(String(id || ''))) {
    try {
      return await wpCategoryService().deleteCategory(id);
    } catch (err) {
      if (isMysqlContentMode()) throw err;
      if (!err.statusCode || err.statusCode !== 404) throw err;
    }
  }

  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');

  // Cascade delete subcategories
  await Category.deleteMany({ parent: id });
  await category.deleteOne();
  return category;
};

/**
 * Reorder siblings. Pass parentId null for top-level categories.
 * orderedIds: array of category ids in desired order.
 */
const reorderCategories = async ({ orderedIds = [], parentId = null } = {}) => {
  if (!Array.isArray(orderedIds) || !orderedIds.length) {
    throw new ApiError(400, 'orderedIds array is required');
  }

  const parentFilter = parentId
    ? { parent: parentId }
    : { $or: [{ parent: null }, { parent: { $exists: false } }] };

  await Promise.all(
    orderedIds.map(async (id, index) => {
      const updated = await Category.findOneAndUpdate(
        { _id: id, ...parentFilter },
        { order: index + 1 },
        { new: true }
      );
      // Also allow reorder when parent filter is loose for legacy docs
      if (!updated) {
        await Category.findByIdAndUpdate(id, {
          order: index + 1,
          parent: parentId || null,
        });
      }
    })
  );

  return getCategories(false, { tree: true });
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  buildTree,
};
