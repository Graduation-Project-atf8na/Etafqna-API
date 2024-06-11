const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.updateUserValidator = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Too short User name')
    .isLength({ max: 32 })
    .withMessage('Too long User name'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .custom((val, { req }) => {
      req.body.email = val.toLowerCase();
      return true;
    }),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  validatorMiddleware
];
