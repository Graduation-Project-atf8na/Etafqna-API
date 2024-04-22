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
    resizeImage,
    uploadImageToCloudinary,
    setCategoryIdToBody,
    createSubcategory
  );

router
  .route('/:id')
  .get(getSubcategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadSubcategoryImage,
    resizeImage,
    uploadImageToCloudinary,
    updateSubcategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteImageFromCloudinary,
    deleteSubcategory
  );

module.exports = router;
