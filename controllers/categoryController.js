const fs = require('fs');
const path = require('path');

const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
// const asyncHandler = require('express-async-handler');

const factory = require('./factoryHandler');
const Category = require('../models/categoryModel');
const { uploadSingleImage } = require('../utils/multer');
const catchAsync = require('../utils/catchAsync');
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage
} = require('../utils/cloudinary');

// @desc    Upload Category Image
// @route   POST /api/v1/categories
// @access  Private
exports.uploadCategoryImage = uploadSingleImage('image');

// // Image Processing
const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
const imagePath = path.join(__dirname, `../public/img/categories/${fileName}`);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/categories/${fileName}`);

  // save image name to req.body to save in database
  // If Cloudinary is not used
  // req.body.image = fileName;

  next();
});

exports.uploadImageToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // 1) Check if Image Exist When Updating
  if (req.params.id) {
    const category = await Category.findById(req.params.id);
    const publicId = category.get('image.public_id');
    // console.log(publicId);

    // Delete Image from Cloudinary
    if (publicId) await cloudinaryDeleteImage(publicId);
  }

  //2) Upload Image to Cloudinary
  const result = await cloudinaryUploadImage(imagePath, 'category_Images');
  // console.log(result);

  // 3) save image name to req.body to save in database
  req.body.image = {
    public_id: result.public_id,
    url: result.secure_url
  };

  // 4) Delete image from server
  fs.unlinkSync(imagePath);

  next();
});

exports.deleteImageFromCloudinary = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    const publicId = category.get('image.public_id');
    // console.log(publicId);

    // Delete Image from Cloudinary
    if (publicId) await cloudinaryDeleteImage(publicId);
  }

  next();
});
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
