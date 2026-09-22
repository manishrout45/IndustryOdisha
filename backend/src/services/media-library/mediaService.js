const path = require('path');
const fs = require('fs');
const Media = require('../../models/media/Media');
const ApiError = require('../../utils/ApiError');
const { cloudinary } = require('../../config/cloudinary');
const { MEDIA_TYPES } = require('../../config/constants');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return MEDIA_TYPES.IMAGE;
  if (mimetype.startsWith('video/')) return MEDIA_TYPES.VIDEO;
  return MEDIA_TYPES.DOCUMENT;
};

const uploadMedia = async (file, user, meta = {}) => {
  const type = getMediaType(file.mimetype);
  let url = `/uploads/${type}s/${file.filename}`;

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `news-portal/${type}s`,
      resource_type: type === MEDIA_TYPES.VIDEO ? 'video' : 'image',
      chunk_size: type === MEDIA_TYPES.VIDEO ? 6_000_000 : undefined,
    });
    url = result.secure_url;
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }

  return Media.create({
    filename: file.filename,
    originalName: file.originalname,
    url,
    type,
    mimeType: file.mimetype,
    size: file.size,
    altText: meta.altText,
    caption: meta.caption,
    uploadedBy: user._id,
  });
};

const getMediaLibrary = async (query = {}, user = null) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  const [media, total] = await Promise.all([
    Media.find(filter)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Media.countDocuments(filter),
  ]);

  return {
    media,
    meta: buildPaginationMeta(total, page, limit),
  };
};

const deleteMedia = async (id, user) => {
  const media = await Media.findById(id);
  if (!media) throw new ApiError(404, 'Media not found');

  if (media.uploadedBy.toString() !== user._id.toString() && user.role === 'author') {
    throw new ApiError(403, 'You can only delete your own media');
  }

  if (!media.url.startsWith('http')) {
    const filePath = path.join(process.cwd(), media.url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await media.deleteOne();
  return media;
};

module.exports = { uploadMedia, getMediaLibrary, deleteMedia };
