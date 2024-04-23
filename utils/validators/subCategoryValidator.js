const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');
const Subcategory = require('../../models/subcategoryModel');

exports.getSubCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Subcategory id format')
    // Check if Subcategory exist
    .custom((id) =>
      Subcategory.findById(id).then((subcategory) => {
        if (!subcategory) {
          return Promise.reject(new Error(`No Subcategory for this id: ${id}`));
        }
      })
    ),
  validatorMiddleware
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory Name required')
    .isLength({ min: 2 })
    .withMessage('Too short Subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long Subcategory name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('category')
    .notEmpty()
    .withMessage('Subcategory must be belong to category')
    .isMongoId()
    .withMessage('Invalid Category id format')
    // Check if Category exist
    .custom((category) =>
      Category.findById(category).then((c) => {
        if (!c) {
          return Promise.reject(
            new Error(`No category for this id: ${category}`)
          );
        }
      })
    ),

  validatorMiddleware
];

exports.updateSubCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Subcategory id format')
    // Check if Subcategory exist
    .custom((id) =>
      Subcategory.findById(id).then((subcategory) => {
        if (!subcategory) {
          return Promise.reject(new Error(`No Subcategory for this id: ${id}`));
        }
      })
    ),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Too short Subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long Subcategory name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category id format')
    // Check if Category exist
    .custom((category) =>
      Category.findById(category).then((c) => {
        if (!c) {
          return Promise.reject(
            new Error(`No category for this id: ${category}`)
          );
        }
      })
    ),
  validatorMiddleware
];

exports.deleteSubCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid SubCategory id format')
    // Check if SubCategory exist
    .custom((id) =>
      Subcategory.findById(id).then((subcategory) => {
        if (!subcategory) {
          return Promise.reject(new Error(`No Subcategory for this id: ${id}`));
        }
      })
    ),
  validatorMiddleware
];
