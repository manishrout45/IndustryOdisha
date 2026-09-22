const Advertisement = require('../../models/advertisement/Advertisement');
const ApiError = require('../../utils/ApiError');
const { AD_POSITIONS } = require('../../config/constants');

const ALL_POSITION_VALUES = Object.values(AD_POSITIONS);

const parsePositionsInput = (raw) => {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      /* comma-separated */
    }
    return trimmed
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeAdPayload = (data = {}, { partial = false } = {}) => {
  const payload = { ...data };
  delete payload.image;

  if (typeof payload.isActive === 'string') {
    payload.isActive =
      payload.isActive === 'true' || payload.isActive === '1';
  }

  const touchesPositions =
    data.positions !== undefined ||
    data.position !== undefined ||
    data.allPositions !== undefined;

  if (!touchesPositions && partial) {
    return payload;
  }

  if (typeof payload.allPositions === 'string') {
    payload.allPositions =
      payload.allPositions === 'true' || payload.allPositions === '1';
  }

  let positions = parsePositionsInput(payload.positions);

  if (!positions.length && payload.position) {
    positions = [payload.position];
  }

  positions = [...new Set(positions)].filter((p) =>
    ALL_POSITION_VALUES.includes(p)
  );

  const allPositions = Boolean(payload.allPositions);

  return {
    ...payload,
    allPositions,
    positions: allPositions ? [...ALL_POSITION_VALUES] : positions,
    position: (allPositions ? ALL_POSITION_VALUES : positions)[0],
  };
};

const getActiveAds = async (position) => {
  const now = new Date();
  const filter = {
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };

  if (position) {
    filter.$and.push({
      $or: [
        { allPositions: true },
        { positions: position },
        { position },
      ],
    });
  }

  return Advertisement.find(filter).sort({ createdAt: -1 });
};

const getAllAds = async () => Advertisement.find().sort({ createdAt: -1 });

const createAd = async (data, user) => {
  const payload = normalizeAdPayload(data);

  if (!payload.allPositions && (!payload.positions || !payload.positions.length)) {
    throw new ApiError(400, 'Select at least one display position');
  }

  return Advertisement.create({ ...payload, createdBy: user._id });
};

const updateAd = async (id, data) => {
  const payload = normalizeAdPayload(data, { partial: true });

  const touchesPositions =
    data.positions !== undefined ||
    data.position !== undefined ||
    data.allPositions !== undefined;

  if (
    touchesPositions &&
    !payload.allPositions &&
    (!payload.positions || !payload.positions.length)
  ) {
    throw new ApiError(400, 'Select at least one display position');
  }

  const ad = await Advertisement.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!ad) throw new ApiError(404, 'Advertisement not found');
  return ad;
};

const deleteAd = async (id) => {
  const ad = await Advertisement.findByIdAndDelete(id);
  if (!ad) throw new ApiError(404, 'Advertisement not found');
  return ad;
};

const trackAdClick = async (id) => {
  const ad = await Advertisement.findByIdAndUpdate(
    id,
    { $inc: { clicks: 1 } },
    { new: true }
  );
  if (!ad) throw new ApiError(404, 'Advertisement not found');
  return ad;
};

const trackAdImpression = async (id) => {
  await Advertisement.findByIdAndUpdate(id, { $inc: { impressions: 1 } });
};

module.exports = {
  getActiveAds,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  trackAdClick,
  trackAdImpression,
  normalizeAdPayload,
};
