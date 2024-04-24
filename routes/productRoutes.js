const express = require('express');

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,

  addUserToBody,
  addCategoryIdToBody,
  createFilterOpj,

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

// mergeParams: allow us to access parameters on other routes
const router = express.Router({ mergeParams: true });

router.route('/').get(createFilterOpj, getAllProducts).post(
  authController.protect,
  handleProductImages,

  addUserToBody,
  addCategoryIdToBody,

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

    addCategoryIdToBody,
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
