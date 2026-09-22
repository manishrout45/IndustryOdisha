const mongoose = require('mongoose');
const { HOMEPAGE_SECTION_TYPES } = require('../../config/constants');

const homepageSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(HOMEPAGE_SECTION_TYPES),
      required: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    config: {
      // String so WordPress term ids work when DB_TYPE=mysql
      categoryId: { type: String, default: null },
      articleIds: [{ type: String }],
      limit: { type: Number, default: 6 },
      customHtml: { type: String, default: '' },
      showTitle: { type: Boolean, default: true },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
