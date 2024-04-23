const express = require('express');

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator
} = require('../utils/validators/categoryValidator');

const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  uploadImageToCloudinary,
  resizeImage,
  deleteImageFromCloudinary
} = require('../controllers/categoryController');

const authController = require('../controllers/authController');
const subCategoryRoute = require('./subcategoryRoutes');

const router = express.Router();

// Nested Route
// Enable Create Subcategory /Get All Subcategories in Category
router.use('/:categoryId/subcategories', subCategoryRoute);

router.route('/').get(getAllCategories).post(
  // Auth
  authController.protect,
  authController.restrictTo('admin'),

  // Body-from handler
  uploadCategoryImage,

  // Validators
  createCategoryValidator,

  // Image Middlewares
  resizeImage,
  uploadImageToCloudinary,

  // Controller
  createCategory
);

router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(
    // Auth
    authController.protect,
    authController.restrictTo('admin'),

    // body-from handler
    uploadCategoryImage,

    // Validators
    updateCategoryValidator,

    // Image Middlewares
    resizeImage,
    uploadImageToCloudinary,

    // Controller
    updateCategory
  )
  .delete(
    // Auth
    authController.protect,
    authController.restrictTo('admin'),

    // Validators
    deleteCategoryValidator,

    // Controller
    deleteImageFromCloudinary,
    deleteCategory
  );

module.exports = router;
