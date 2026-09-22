const mongoose = require('mongoose');
const { ARTICLE_STATUS } = require('../../config/constants');
const { generateSlug } = require('../../utils/slugify');

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    metaKeywords: [{ type: String }],
    ogImage: { type: String },
    canonicalUrl: { type: String },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
    },

    featuredImage: {
      type: String,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],

    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.DRAFT,
    },

    isBreaking: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isDontMiss: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    seo: seoSchema,

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({
  status: 1,
  publishedAt: -1,
});

articleSchema.index({
  isBreaking: 1,
  publishedAt: -1,
});

articleSchema.index({
  isTrending: 1,
  viewCount: -1,
});

articleSchema.index({
  status: 1,
  viewCount: -1,
});

articleSchema.index({
  author: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Auto Generate Slug
|--------------------------------------------------------------------------
*/

articleSchema.pre('validate', function setSlug() {
  if (
    this.title &&
    (!this.slug || this.isModified('title'))
  ) {
    this.slug = generateSlug(this.title);
  }
});

/*
|--------------------------------------------------------------------------
| Set Published Date
|--------------------------------------------------------------------------
*/

articleSchema.pre('save', function setPublishedAt() {
  if (
    this.isModified('status') &&
    this.status === ARTICLE_STATUS.PUBLISHED &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model(
  'Article',
  articleSchema
);