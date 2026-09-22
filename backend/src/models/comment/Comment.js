const mongoose = require('mongoose');
const { COMMENT_STATUS } = require('../../config/constants');

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    content: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: Object.values(COMMENT_STATUS),
      default: COMMENT_STATUS.PENDING,
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

commentSchema.index({ article: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
