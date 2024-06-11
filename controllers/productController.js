const fs = require('fs');
const path = require('path');

const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

// const pLimit = import('p-limit');
const Subcategory = require('../models/subcategoryModel');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/productModel');
const { uploadMultipleImages } = require('../utils/multer');
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage
} = require('../utils/cloudinary');

// Image Processing
const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

const imageCoverPath = path.join(
  __dirname,
  `../public/img/products/${imageCoverFileName}`
);

exports.handleProductImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  const imagesFileNameArr = [];

  //1) if no file "IMAGEs" is uploaded
  if (!req.files) return next();
  //console.log(req.files);

  //Image Cover processing
  if (req.files.imageCover) {
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${imageCoverFileName}`);
  }

  //Images processing
  if (req.files.images) {
    // req.body.images = [];
    await Promise.all(
      //map is not async function so we use Promise.all
      // console.log(req.files.images),
      req.files.images.map(async (img, i) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${imageName}`);

        // Save Images paths to array
        imagesFileNameArr.push(imageName);
      })
    );
  }
  // console.log(imagesFileNameArr);
  req.imagePaths = imagesFileNameArr;
  // console.log(req.imagePaths);

  next();
});

exports.uploadImageCoverToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover) return next();

  // 1) Check if ImageCover Exist When Updating
  if (req.params.id) {
    const product = await Product.findById(req.params.id);
    const publicId = product.get('imageCover.public_id');
    // console.log(publicId);

    // Delete Image from Cloudinary
    if (publicId) await cloudinaryDeleteImage(publicId);
  }

  //2) Upload Image to Cloudinary
  const result = await cloudinaryUploadImage(imageCoverPath, 'product_Images');
  // console.log(result);

  // 3) save image name to req.body to save in database
  req.body.imageCover = {
    public_id: result.public_id,
    url: result.secure_url
  };

  // 4) Delete image from server
  fs.unlinkSync(imageCoverPath);

  next();
});

exports.uploadImagesToCloudinary = catchAsync(async (req, res, next) => {
  const imgInfo = [];
  if (!req.files.images) return next();
  // console.log(req.files.images);

  // 1) Check if Images Exists When Updating
  if (req.params.id && req.files.images.length > 0) {
    const product = await Product.findById(req.params.id);
    const publicIds = product.get('images.public_id');
    // console.log(publicIds);

    // Delete Image from Cloudinary
    if (publicIds.length > 0)
      await Promise.all(
        publicIds.map(async (id) => {
          await cloudinaryDeleteImage(id);
        })
      );
  }

  // const plimit = await pLimit;
  // const limit = plimit(5);

  await Promise.all(
    req.imagePaths.map(async (img) => {
      // await limit(async () => {
      const result = await cloudinaryUploadImage(
        `public/img/products/${img}`,
        'product_Images'
      );
      // console.log(result);

      fs.unlinkSync(`public/img/products/${img}`);
      // save image name to req.body to save in database
      imgInfo.push({
        public_id: result.public_id,
        url: result.secure_url
      });

      req.body.images = imgInfo;

      // });
      // 4) Delete image from server
      // fs.unlinkSync(`public/img/products/${img}`);
    })
  );

  next();
});

exports.deleteImageCoverFromCloudinary = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  const publicId = product.get('imageCover.public_id');
  // console.log(publicId);

  // Delete Image from Cloudinary
  if (publicId) await cloudinaryDeleteImage(publicId);

  next();
});

exports.deleteImagesFromCloudinary = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  const publicIds = product.get('images.public_id');
  // console.log(publicIds);

  // Delete Image from Cloudinary
  if (publicIds.length > 0)
    await Promise.all(
      publicIds.map(async (id) => {
        await cloudinaryDeleteImage(id);
      })
    );

  next();
});

exports.checkSubcategoriesBelongToCategory = catchAsync(
  async (req, res, next) => {
    if (req.body.subcategories) {
      const subcategoriesIdsInBody = req.body.subcategories.split(',');
      // console.log(subcategoriesIdsInBody);

      // Get all subcategories in DB that belong to category in request
      const subObj = await Subcategory.find({
        category: req.body.category
      }).select('_id');

      const subcategoriesIdsInDB = subObj.map((sub) => sub._id.toString());
      // console.log(subcategoriesIdsInDB);

      // console.log(req.body.category);

      const isSubcategoriesBelongToCategory = subcategoriesIdsInBody.every(
        (sub) => subcategoriesIdsInDB.includes(sub)
      );

      let notIncludedValues = [];
      notIncludedValues = subcategoriesIdsInBody.filter(
        (value) => !subcategoriesIdsInDB.includes(value)
      );
      // console.log(`not includes: ${notIncludedValues}`);

      if (!isSubcategoriesBelongToCategory) {
        return next(
          new AppError(
            `Subcategory: ${notIncludedValues} not belong to Category!`,
            400
          )
        );
      }
    }

    next();
  }
);

// exports.addUserIdToBody = (req, res, next) => {
//   // Adding Product Owner to the body of the request to Create Product
//   req.body.owner = req.user.id;
//   // Adding Product location according to the Owner location
//   //req.body.location = req.user.location;

//   next();
// };

// Nested Route

// Post /api/v1/categories/:categoryId/subcategories
// while creating Subcategory form Category
exports.addCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// To get all Products of a specific....
exports.createFilterOpj = (req, res, next) => {
  let filterObject = {};
  // for nested route to get all products of a specific category
  // Get /api/v1/categories/:categoryId/products
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };

  // for nested route to get all products of a specific subcategory
  // Get /api/v1/subcategories/:subcategoryId/products
  if (req.params.subcategoryId)
    filterObject = { subcategories: req.params.subcategoryId };

  // for nested route to get all products of a specific user
  // Get /api/v1/users/:userId/products
  if (req.params.userId) filterObject = { owner: req.params.userId };

  req.filterObj = filterObject;
  next();
};

// @desc    Get list of Following Products
// @route   GET /api/v1/products/following
// @access  Private
exports.getFollowingProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ user: { $in: req.user.following } });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// @desc    Get list of NearBy Products
// @route   GET /api/v1/products/nearby
// @access  Private
exports.getNearByProducts = catchAsync(async (req, res, next) => {
  let location = [];
  // console.log(parseInt(req.query.maxDistance));

  if (req.query.location) {
    // eslint-disable-next-line prefer-destructuring
    location = req.query.location;
    // casting to array
    location = location.split(',').map((el) => parseFloat(el));

    // using longitude and latitude
    // const { log, lat } = req.query;
    // locations = [log, lat];
  } else if (req.user.location) {
    // console.log('user lacation', req.user.location);
    // location = JSON.parse(req.user.location);
    location = req.user.location.coordinates;
    // console.log('Near By location', location);
  } else {
    return next(new AppError('Please provide locations', 400));
  }

  // console.log(locations);

  const products = await Product.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: location
        },
        // $ditanceMultiplier: 0.001,
        $maxDistance: parseInt(req.query.maxDistance, 10) * 1000 || 500000 // 500km
      }
    }
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// @desc    Get list of Products
// @route   GET /api/v1/products/
// @access  Public
exports.getAllProducts = factory.getAll(Product, 'Product');

// @desc    Get specific Product by id
// @route   GET api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product);

// @desc    Create Product
// @route   POST /api/v1/products
// @access  Public
exports.createProduct = factory.createOne(Product);

// @desc    Update specific Product
// @route   Patch /api/v1/categories/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific Product
// @route   Delete /api/v1/categories/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);
