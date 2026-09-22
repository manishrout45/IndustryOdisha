const HomepageVideo = require('../../models/video/HomepageVideo');
const ApiError = require('../../utils/ApiError');

const normalizeVideoPayload = (data = {}) => {
  const payload = { ...data };
  delete payload.thumbnail;
  delete payload.video;

  if (typeof payload.isActive === 'string') {
    payload.isActive =
      payload.isActive === 'true' || payload.isActive === '1';
  }

  if (payload.order !== undefined) {
    payload.order = Number(payload.order) || 0;
  }

  if (payload.fileSize !== undefined) {
    payload.fileSize = Number(payload.fileSize) || 0;
  }

  return payload;
};

const getActiveVideos = async (limit = 6) => {
  const query = HomepageVideo.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });
  if (limit) query.limit(limit);
  return query;
};

const getAllVideos = async () =>
  HomepageVideo.find().sort({ order: 1, createdAt: -1 });

const getVideoById = async (id) => {
  const video = await HomepageVideo.findById(id);
  if (!video) throw new ApiError(404, 'Video not found');
  return video;
};

const createVideo = async (data, user) => {
  const payload = normalizeVideoPayload(data);
  if (!payload.title?.trim()) throw new ApiError(400, 'Title is required');
  if (!payload.videoUrl?.trim()) {
    throw new ApiError(400, 'Please upload a video file (MP4/WebM, max 120MB)');
  }

  if (payload.order === undefined) {
    const last = await HomepageVideo.findOne().sort({ order: -1 }).select('order');
    payload.order = (last?.order ?? -1) + 1;
  }

  return HomepageVideo.create({
    ...payload,
    createdBy: user?._id,
  });
};

const updateVideo = async (id, data) => {
  const payload = normalizeVideoPayload(data);
  const video = await HomepageVideo.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!video) throw new ApiError(404, 'Video not found');
  return video;
};

const deleteVideo = async (id) => {
  const video = await HomepageVideo.findByIdAndDelete(id);
  if (!video) throw new ApiError(404, 'Video not found');
  return video;
};

module.exports = {
  getActiveVideos,
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
