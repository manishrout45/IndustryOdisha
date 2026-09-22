const mongoose = require('mongoose');
const { AD_POSITIONS } = require('../../config/constants');

const positionValues = Object.values(AD_POSITIONS);

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // Legacy single position (kept for older ads)
    position: {
      type: String,
      enum: positionValues,
    },
    // Multi-select positions for one creative
    positions: {
      type: [{ type: String, enum: positionValues }],
      default: [],
    },
    // When true, ad runs in every display slot
    allPositions: { type: Boolean, default: false },
    imageUrl: { type: String },
    targetUrl: { type: String },
    htmlContent: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);
