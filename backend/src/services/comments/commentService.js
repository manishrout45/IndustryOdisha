const Comment = require('../../models/comment/Comment');
const Article = require('../../models/article/Article');
const ApiError = require('../../utils/ApiError');
const { COMMENT_STATUS } = require('../../config/constants');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const getArticleComments = async (articleId, query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const [comments, total] = await Promise.all([
    Comment.find({ article: articleId, status: COMMENT_STATUS.APPROVED, parent: null })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ article: articleId, status: COMMENT_STATUS.APPROVED }),
  ]);

  return { comments, meta: buildPaginationMeta(total, page, limit) };
};

const createComment = async (data) => {
  const article = await Article.findById(data.article);
  if (!article) throw new ApiError(404, 'Article not found');

  if (!data.author && (!data.guestName || !data.guestEmail)) {
    throw new ApiError(400, 'Guest name and email are required');
  }

  return Comment.create(data);
};

const getAllComments = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.article) filter.article = query.article;

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate('article', 'title slug')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  return { comments, meta: buildPaginationMeta(total, page, limit) };
};

const moderateComment = async (id, status, moderator) => {
  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  comment.status = status;
  comment.moderatedBy = moderator._id;
  await comment.save();

  return comment;
};

const deleteComment = async (id) => {
  const comment = await Comment.findByIdAndDelete(id);
  if (!comment) throw new ApiError(404, 'Comment not found');
  return comment;
};

module.exports = {
  getArticleComments,
  createComment,
  getAllComments,
  moderateComment,
  deleteComment,
};
