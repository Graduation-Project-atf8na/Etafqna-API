const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid category id format')
    .notEmpty()
    .withMessage('Category ID required'),
  validatorMiddleware
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category Name required')
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

exports.updateCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid category id format')
    .notEmpty()
    .withMessage('Category ID required'),
  body('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

exports.deleteCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid category id format')
    .notEmpty()
    .withMessage('Category ID required'),
  validatorMiddleware
];
