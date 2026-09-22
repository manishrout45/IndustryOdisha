const SiteSeo = require('../../models/seo/SiteSeo');
const ApiError = require('../../utils/ApiError');

const getSiteSeo = async () => {
  let seo = await SiteSeo.findOne();
  if (!seo) {
    seo = await SiteSeo.create({});
  }
  return seo;
};

const updateSiteSeo = async (data, user) => {
  let seo = await SiteSeo.findOne();

  if (!seo) {
    seo = await SiteSeo.create({ ...data, updatedBy: user._id });
    return seo;
  }

  Object.assign(seo, data, { updatedBy: user._id });
  await seo.save();
  return seo;
};

module.exports = { getSiteSeo, updateSiteSeo };
