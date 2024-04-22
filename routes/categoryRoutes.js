const express = require('express');

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

router
  .route('/')
  .get(getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    uploadCategoryImage,
    resizeImage,
    uploadImageToCloudinary,
    createCategory
  );

router
  .route('/:id')
  .get(getCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadCategoryImage,
    resizeImage,
    uploadImageToCloudinary,
    updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteImageFromCloudinary,
    deleteCategory
  );

module.exports = router;
