const fs = require('fs');
const path = require('path');

const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
// const asyncHandler = require('express-async-handler');

// const AppError = require('../utils/appError');
const factory = require('./factoryHandler');
const Subcategory = require('../models/subcategoryModel');
// const Category = require('../models/categoryModel');

const { uploadSingleImage } = require('../utils/multer');
const catchAsync = require('../utils/catchAsync');

const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage
} = require('../utils/cloudinary');

// @desc    Upload Subcategory Image
// @route   POST /api/v1/subcategories
// @access  Private
exports.uploadSubcategoryImage = uploadSingleImage('image');

// // Image Processing
const fileName = `subcategory-${uuidv4()}-${Date.now()}.jpeg`;
const imagePath = path.join(
  __dirname,
  `../public/img/subcategories/${fileName}`
);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/subcategories/${fileName}`);

  // save image name to req.body to save in database
  // If Cloudinary is not used
  // req.body.image = fileName;

  next();
});

exports.uploadImageToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // 1) Check if Image Exist When Updating
  if (req.params.id) {
    const subcategory = await Subcategory.findById(req.params.id);
    const publicId = subcategory.get('image.public_id');
    // console.log(publicId);

    // Delete Image from Cloudinary
    if (publicId) await cloudinaryDeleteImage(publicId);
  }

  //2) Upload Image to Cloudinary
  const result = await cloudinaryUploadImage(imagePath);
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
  const subcategory = await Subcategory.findById(req.params.id);

  // if (!subcategory) return next();

  const publicId = subcategory.get('image.public_id');
  // console.log(publicId);

  // Delete Image from Cloudinary
  if (publicId) await cloudinaryDeleteImage(publicId);

  next();
});

// Nested Route

// Post /api/v1/categories/:categoryId/subcategories
// while creating Subcategory form Category
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  //   console.log(req.body.category);

  next();
};

// Get /api/v1/categories/:categoryId/subcategories
// To get all subcategories of a specific category
exports.createFilterOpj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of SubCategories
// @route   GET /api/v1/subcategories/
// @access  Public
exports.getAllSubcategories = factory.getAll(Subcategory);

// @desc    Get specific Subcategory by id
// @route   GET api/v1/subcategories/:id
// @access  Public
exports.getSubcategory = factory.getOne(Subcategory);

// @desc    Create Subcategory
// @route   POST /api/v1/subcategories
// @access  Private
exports.createSubcategory = factory.createOne(Subcategory);

// @desc    Update specific Subcategory
// @route   Patch /api/v1/subcategories/:id
// @access  Private
exports.updateSubcategory = factory.updateOne(Subcategory);

// @desc    Delete specific Subcategory
// @route   Delete /api/v1/subcategories/:id
// @access  Private
exports.deleteSubcategory = factory.deleteOne(Subcategory);
