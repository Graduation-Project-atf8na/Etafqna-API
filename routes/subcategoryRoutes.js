const express = require('express');

const {
  setCategoryIdToBody,
  createFilterOpj,

  createSubcategory,
  getAllSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,

  uploadSubcategoryImage,
  resizeImage,
  uploadImageToCloudinary,
  deleteImageFromCloudinary
} = require('../controllers/subcategoryController');

const {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator
} = require('../utils/validators/subCategoryValidator');

const authController = require('../controllers/authController');

// mergeParams: allow us to access parameters on other routes
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(createFilterOpj, getAllSubcategories)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    uploadSubcategoryImage,
    createSubCategoryValidator,
    resizeImage,
    uploadImageToCloudinary,
    setCategoryIdToBody,
    createSubcategory
  );

router
  .route('/:id')
  .get(getSubCategoryValidator, getSubcategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadSubcategoryImage,
    updateSubCategoryValidator,
    resizeImage,
    uploadImageToCloudinary,
    updateSubcategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteSubCategoryValidator,
    deleteImageFromCloudinary,
    deleteSubcategory
  );

module.exports = router;
