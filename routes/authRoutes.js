const express = require('express');

const authController = require('../controllers/authController');
const validateLocation = require('../utils/validators/locationValidator');

const router = express.Router();

router.post('/signup', validateLocation, authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/verifyCode', authController.verifyCode);
router.post('/resetPassword', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

module.exports = router;
