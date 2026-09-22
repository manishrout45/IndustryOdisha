const mongoose = require('mongoose');
const { MEDIA_TYPES } = require('../../config/constants');

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(MEDIA_TYPES),
      required: true,
    },
    mimeType: { type: String },
    size: { type: Number },
    altText: { type: String },
    caption: { type: String },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
