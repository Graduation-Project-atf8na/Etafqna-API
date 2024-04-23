const express = require('express');

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addUserToBody,
  addCategoryToBody,
  handleProductImages,
  resizeProductImages,
  uploadImageCoverToCloudinary,
  uploadImagesToCloudinary,
  deleteImageCoverFromCloudinary,
  deleteImagesFromCloudinary
} = require('../controllers/productController');

const {
  createProductValidator,
  updateProductValidator,
  getProductValidator,
  deleteProductValidator
} = require('../utils/validators/productValidator');

const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllProducts).post(
  authController.protect,

  handleProductImages,
  addUserToBody,
  createProductValidator,
  resizeProductImages,
  uploadImageCoverToCloudinary,
  uploadImagesToCloudinary,
  createProduct
);

router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    handleProductImages,

    addCategoryToBody,
    updateProductValidator,

    resizeProductImages,
    uploadImageCoverToCloudinary,
    uploadImagesToCloudinary,
    updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),

    deleteProductValidator,

    deleteImageCoverFromCloudinary,
    deleteImagesFromCloudinary,
    deleteProduct
  );

module.exports = router;
