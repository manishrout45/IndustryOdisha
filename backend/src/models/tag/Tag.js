const mongoose = require('mongoose');
const { generateSlug } = require('../../utils/slugify');

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ✅ FIXED VERSION (NO next)
tagSchema.pre('save', function () {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model('Tag', tagSchema);