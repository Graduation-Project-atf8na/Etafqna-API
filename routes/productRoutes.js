const express = require('express');

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  checkSubcategoriesBelongToCategory,
  handleProductImages,
  resizeProductImages,
  uploadImageCoverToCloudinary,
  uploadImagesToCloudinary,
  deleteImageCoverFromCloudinary,
  deleteImagesFromCloudinary
} = require('../controllers/productController');

const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllProducts)
  .post(
    authController.protect,
    handleProductImages,
    resizeProductImages,
    checkSubcategoriesBelongToCategory,
    uploadImageCoverToCloudinary,
    uploadImagesToCloudinary,
    createProduct
  );

router
  .route('/:id')
  .get(getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    handleProductImages,
    resizeProductImages,
    checkSubcategoriesBelongToCategory,
    uploadImageCoverToCloudinary,
    uploadImagesToCloudinary,
    updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    deleteImageCoverFromCloudinary,
    deleteImagesFromCloudinary,
    deleteProduct
  );

module.exports = router;
