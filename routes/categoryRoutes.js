const express = require('express');

const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  uploadImageToCloudinary,
  resizeImage
} = require('../controllers/categoryController');

// const subcategoryRoute = require('./subCategoryRoute');

const router = express.Router();

// Nested Route
// router.use('/:categoryId/subcategories', subcategoryRoute);

router
  .route('/')
  .get(getAllCategories)
  .post(
    uploadCategoryImage,
    resizeImage,
    uploadImageToCloudinary,
    createCategory
  );

router
  .route('/:id')
  .get(getCategory)
  .patch(
    uploadCategoryImage,
    resizeImage,
    uploadImageToCloudinary,
    updateCategory
  )
  .delete(deleteCategory);

module.exports = router;
