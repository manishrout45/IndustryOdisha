const jwt = require('jsonwebtoken');
const User = require('../../models/user/User');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../config/constants');
const { isMongoReady } = require('../../config/mongo');

const requireMongo = () => {
  if (!isMongoReady()) {
    throw new ApiError(
      503,
      'User/auth database (MongoDB) is not connected. Check MONGODB_URI or wait until Mongo is available.'
    );
  }
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:
      (parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7) *
      24 *
      60 *
      60 *
      1000,
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    statusCode,
    message: 'Success',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
};

const register = async (data, createdBy) => {
  requireMongo();
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({
    ...data,
    createdBy: createdBy?._id,
  });

  // Mirror author/admin into WordPress when MySQL is the content store
  try {
    const { isMysqlContentMode } = require('../../config/dbMode');
    const { isMysqlReady } = require('../../config/mysql');
    if (isMysqlContentMode() && isMysqlReady()) {
      const { ensureWpUser } = require('../wordpress/wpArticleWrite');
      await ensureWpUser(user);
    }
  } catch (err) {
    console.warn('WordPress user sync skipped:', err.message);
  }

  return user;
};

const login = async (email, password) => {
  requireMongo();
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

const getMe = async (userId) => {
  requireMongo();
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateProfile = async (userId, updates) => {
  requireMongo();
  const allowed = ['name', 'bio', 'avatar'];
  const data = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) data[key] = updates[key];
  });

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  requireMongo();
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();
  return user;
};

const getAllUsers = async (filters = {}) => {
  requireMongo();
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  return User.find(query).sort({ createdAt: -1 }).select('-password');
};

const updateUser = async (userId, updates, requester) => {
  requireMongo();
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (updates.role && requester.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, 'Only super admin can change roles');
  }

  if (user.role === ROLES.SUPER_ADMIN && requester._id.toString() !== userId) {
    throw new ApiError(403, 'Cannot modify super admin account');
  }

  const allowed = ['name', 'email', 'role', 'isActive', 'bio', 'avatar'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) user[key] = updates[key];
  });

  if (updates.password) user.password = updates.password;

  await user.save();
  return user;
};

const deleteUser = async (userId) => {
  requireMongo();
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, 'Cannot delete super admin account');
  }
  await user.deleteOne();
  return user;
};

module.exports = {
  signToken,
  sendTokenResponse,
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUser,
  deleteUser,
};
