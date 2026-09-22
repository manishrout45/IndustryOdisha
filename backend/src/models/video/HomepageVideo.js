const mongoose = require('mongoose');

const homepageVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    fileSize: { type: Number, default: 0 },
    originalName: { type: String, trim: true },
    categoryLabel: { type: String, trim: true, default: 'Video' },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

homepageVideoSchema.index({ isActive: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model('HomepageVideo', homepageVideoSchema);
