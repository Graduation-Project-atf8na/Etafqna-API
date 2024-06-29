const express = require('express');

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,

  getFollowingProducts,
  getNearByProducts,
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

const validateLocation = require('../utils/validators/locationValidator');

const authController = require('../controllers/authController');

// mergeParams: allow us to access parameters on other routes
const router = express.Router({ mergeParams: true });

router.use('/following', authController.protect, getFollowingProducts);

router.use('/nearby', authController.protect, getNearByProducts);

router.route('/').get(createFilterOpj, getAllProducts).post(
  authController.protect,
  handleProductImages,

  addCategoryIdToBody,

  createProductValidator,
  validateLocation,

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
