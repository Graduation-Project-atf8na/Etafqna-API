/* eslint-disable no-shadow */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Product = require('../models/productModel');

const { uploadSingleImage } = require('../utils/multer');

const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage
} = require('../utils/cloudinary');

exports.uploadUserImage = uploadSingleImage('image');

// Image Processing
const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
const imagePath = path.join(__dirname, `../public/img/users/${fileName}`);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${fileName}`);

  // save image name to req.body to save in database
  // If Cloudinary is not used
  // req.body.image = fileName;

  next();
});

exports.uploadImageToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // 1) Check if Image Exist When Updating
  if (req.user.id) {
    const user = await User.findById(req.user.id);
    const publicId = user.get('image.public_id');
    // console.log(publicId);

    // Delete Image from Cloudinary if it exists and not the default image
    if (publicId && publicId !== 'avatars/default_avatar_oc1d4h') {
      await cloudinaryDeleteImage(publicId);
    }
  }

  // 2) Upload Image to Cloudinary
  const result = await cloudinaryUploadImage(imagePath, 'user_images');

  // 3) Save Image URL and Public ID to req.body
  req.body.image = {
    url: result.secure_url,
    public_id: result.public_id
  };

  // 4) Delete the image from local server
  fs.unlinkSync(imagePath);

  next();
});

exports.getMe = (req, res, next) => {
  // The user ID is available in req.user.id
  req.params.id = req.user.id;
  next();
};

exports.getMyProducts = catchAsync(async (req, res, next) => {
  // The user ID is available in req.user.id
  req.params.userId = req.user.id;
  next();
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.changeRole = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // Delete Image from Cloudinary if it exists and not the default image
  const user = await User.findById(req.params.id);
  const publicId = user.get('image.public_id');

  if (publicId && publicId !== 'avatars/default_avatar_oc1d4h') {
    await cloudinaryDeleteImage(publicId);
  }

  // Delete all products of the user
  const products = await Product.find({ owner: req.params.id }).select(
    '_id imageCover images'
  );
  //console.log(products);
  if (products.length > 0) {
    products.forEach(async (product) => {
      // Delete Product Image Cover from Cloudinary
      const publicId = product.get('imageCover.public_id');
      await cloudinaryDeleteImage(publicId);
      //console.log('cover deleted');

      // Delete Product Images
      if (product.images.length > 0) {
        product.images.forEach(async (image) => {
          const publicId = image.get('public_id');
          await cloudinaryDeleteImage(publicId);
          //console.log('image deleted');
        });
      }
      // Delete Product document from DB
      await Product.findByIdAndDelete(product._id);
    });
  }

  await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'image',
    'location'
  );
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Soft delete (Deactivate Account)
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllFollowingUsers = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('following');

  res.status(200).json({
    status: 'success',
    length: user.following.length,
    data:
      // eslint-disable-next-line no-shadow
      user.following.map((user) => ({
        id: user._id,
        name: user.name,
        products: user.products,
        image: user.image,
        phone: user.phone
      }))
  });
});

// exports.getFollowingUser = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).populate('following');

//   // Get the user that is being followed
//   const followingUser = user.following.find(
//     // eslint-disable-next-line no-shadow
//     (user) => user.id === req.params.id
//   );

//   if (!followingUser) {
//     return next(
//       new AppError('No user found with that ID in your following', 404)
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       id: followingUser._id,
//       name: followingUser.name,
//       products: followingUser.products,
//       image: followingUser.image,
//       phone: followingUser.phone
//     }
//   });
// });

exports.followUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if user is already following the user
  if (user.following.includes(req.params.id)) {
    return next(new AppError('You are already following this user', 400));
  }

  user.following.push(req.params.id);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.unfollowUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if user is already following the user
  if (!user.following.includes(req.params.id)) {
    return next(new AppError('You are not following this user', 400));
  }

  // Get the index of the user to unfollow
  user.following = user.following.filter(
    (id) => id.toString() !== req.params.id
  );
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getAllFavoriteItems = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('favItems');

  res.status(200).json({
    status: 'success',
    length: user.favItems.length,
    data: user.favItems
  });
});

// exports.getFavoriteItem = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).populate('favItems');

//   // Get the product that is being followed
//   const favoriteProduct = user.favItems.find(
//     (product) => product.id === req.params.id
//   );

//   if (!favoriteProduct) {
//     return next(
//       new AppError('No product found with that ID in your favorite', 404)
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: favoriteProduct
//   });
// });

exports.favoriteItem = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if user is already has the product in favorite
  if (user.favItems.includes(req.params.id)) {
    return next(new AppError('You have already this product', 400));
  }

  user.favItems.push(req.params.id);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.unfavoriteItem = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if user is not already has the product in favorite
  if (!user.favItems.includes(req.params.id)) {
    return next(new AppError('You do not have this product', 400));
  }

  // Get the index of the product to unfavorite
  user.favItems = user.favItems.filter((id) => id.toString() !== req.params.id);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});
