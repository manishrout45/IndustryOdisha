const mongoose = require("mongoose");
const { generateSlug } = require("../../utils/slugify");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, order: 1 });

categorySchema.pre("save", async function () {
  if (!this.isModified("name") && this.slug) return;

  let base = generateSlug(this.name || "category");
  if (this.parent) {
    const parentDoc = await this.constructor.findById(this.parent).select("slug");
    if (parentDoc?.slug) base = `${parentDoc.slug}-${base}`;
  }

  let slug = base;
  let i = 1;
  while (
    await this.constructor.exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
});

categorySchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || update;
  if (!$set.name) return;

  const current = await this.model.findOne(this.getQuery()).select("parent");
  const parentId =
    $set.parent !== undefined ? $set.parent : current?.parent || null;

  let base = generateSlug($set.name);
  if (parentId) {
    const parentDoc = await this.model.findById(parentId).select("slug");
    if (parentDoc?.slug) base = `${parentDoc.slug}-${base}`;
  }

  let slug = base;
  let i = 1;
  const currentId = this.getQuery()._id;
  while (
    await this.model.exists({
      slug,
      _id: { $ne: currentId },
    })
  ) {
    slug = `${base}-${i++}`;
  }

  if (update.$set) update.$set.slug = slug;
  else update.slug = slug;
  this.setUpdate(update);
});

module.exports = mongoose.model("Category", categorySchema);
