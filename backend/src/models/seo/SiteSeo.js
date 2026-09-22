const mongoose = require('mongoose');

const siteSeoSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'News Portal' },
    siteDescription: { type: String },
    defaultMetaTitle: { type: String },
    defaultMetaDescription: { type: String },
    defaultOgImage: { type: String },
    googleAnalyticsId: { type: String },
    googleSearchConsole: { type: String },
    robotsTxt: { type: String },
    sitemapEnabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSeo', siteSeoSchema);
