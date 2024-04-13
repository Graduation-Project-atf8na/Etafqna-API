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

const router = express.Router();

router
  .route('/')
  .get(getAllProducts)
  .post(
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
    handleProductImages,
    resizeProductImages,
    checkSubcategoriesBelongToCategory,
    uploadImageCoverToCloudinary,
    uploadImagesToCloudinary,
    updateProduct
  )
  .delete(
    deleteImageCoverFromCloudinary,
    deleteImagesFromCloudinary,
    deleteProduct
  );

module.exports = router;
