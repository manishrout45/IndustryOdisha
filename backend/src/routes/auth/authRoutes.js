const express = require('express');
const authController = require('../../controllers/auth/authController');
const validate = require('../../middleware/validate');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../../validators/authValidator');
const protect = require('../../middleware/auth/protect');
const authorize = require('../../middleware/auth/authorize');
const { ROLES } = require('../../config/constants');

const router = express.Router();

router.post('/register', protect, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, authController.updateProfile);
router.patch('/change-password', protect, changePasswordValidator, validate, authController.changePassword);

module.exports = router;
