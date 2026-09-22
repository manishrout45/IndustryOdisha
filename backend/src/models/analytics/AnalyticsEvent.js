const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['page_view', 'article_view', 'ad_click', 'search'],
      required: true,
    },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    advertisement: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: {
      path: String,
      referrer: String,
      userAgent: String,
      ip: String,
      searchQuery: String,
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ article: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
