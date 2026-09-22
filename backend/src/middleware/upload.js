const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const { MEDIA_TYPES } = require('../config/constants');

const uploadDirs = {
  [MEDIA_TYPES.IMAGE]: 'uploads/images',
  [MEDIA_TYPES.VIDEO]: 'uploads/videos',
  [MEDIA_TYPES.DOCUMENT]: 'uploads/documents',
};

Object.values(uploadDirs).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, uploadDirs[MEDIA_TYPES.IMAGE]);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, uploadDirs[MEDIA_TYPES.VIDEO]);
    } else {
      cb(null, uploadDirs[MEDIA_TYPES.DOCUMENT]);
    }
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const imageDocFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Unsupported file type'), false);
  }
};

const homepageVideoFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime', // .mov
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Use MP4 or WebM for video (max 120MB) and JPG/PNG/WebP for thumbnail'
      ),
      false
    );
  }
};

/** Default uploads (images, media library) — 50MB */
const upload = multer({
  storage,
  fileFilter: imageDocFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

/** Homepage video + thumbnail — 120MB per file for faster web playback */
const homepageVideoUpload = multer({
  storage,
  fileFilter: homepageVideoFilter,
  limits: { fileSize: 120 * 1024 * 1024 },
});

module.exports = upload;
module.exports.homepageVideoUpload = homepageVideoUpload;
module.exports.MAX_HOMEPAGE_VIDEO_BYTES = 120 * 1024 * 1024;
