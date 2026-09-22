const authService = require('../../services/auth/authService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, req.user);
  authService.sendTokenResponse(user, 201, res);
});

const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body.email, req.body.password);
  authService.sendTokenResponse(user, 200, res);
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.status(200).json(new ApiResponse(200, user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
