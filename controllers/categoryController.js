// const fs = require('fs');

// const sharp = require('sharp');
// const { v4: uuidv4 } = require('uuid');
// const asyncHandler = require('express-async-handler');

// const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const Category = require('../models/categoryModel');
// const upload = require('../middlewares/imageMiddleware');

// @desc    Upload Category Image
// @route   POST /api/v1/categories
// @access  Private
// exports.uploadCategoryImage = upload.uploadSingleImage('image');

// // Image Processing
// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   //1) if no file "IMAGE" is uploaded
//   if (!req.file) return next();

//   //2) delete old image if exists, before uploading new image
//   if (req.params.id) {
//     // console.log(req.params.id);
//     const category = await Category.findById(req.params.id).select(
//       'image -_id'
//     );
//     // console.log(category);
//     if (category.image) {
//       const path = `uploads/categories/${category.image.split('/').pop()}`;
//       fs.unlinkSync(path);
//     }
//   }

//   const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
//   await sharp(req.file.buffer)
//     .resize(600, 600)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`uploads/categories/${fileName}`);

//   // save image name to req.body to save in database
//   req.body.image = fileName;
//   next();
// });

// @desc    Get list of Categories
// @route   GET /api/v1/categories/
// @access  Public
exports.getAllCategories = factory.getAll(Category);

// @desc    Get specific Category by id
// @route   GET api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create Category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update specific Category
// @route   Patch /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete specific Category
// @route   Delete /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
