const express = require('express');

const {
  setCategoryIdToBody,
  createFilterOpj,

  createSubcategory,
  getAllSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  // checkCategoryId,

  uploadSubcategoryImage,
  resizeImage,
  uploadImageToCloudinary,
  deleteImageFromCloudinary
} = require('../controllers/subcategoryController');

// mergeParams: allow us to access parameters on other routes
const router = express.Router({ mergeParams: true });

router.route('/').get(createFilterOpj, getAllSubcategories).post(
  uploadSubcategoryImage,
  resizeImage,
  uploadImageToCloudinary,
  setCategoryIdToBody,
  // checkCategoryId,
  createSubcategory
);

router
  .route('/:id')
  .get(getSubcategory)
  .patch(
    uploadSubcategoryImage,
    resizeImage,
    uploadImageToCloudinary,
    // checkCategoryId,
    updateSubcategory
  )
  .delete(deleteImageFromCloudinary, deleteSubcategory);

module.exports = router;
