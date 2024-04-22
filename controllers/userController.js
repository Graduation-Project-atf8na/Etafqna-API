const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getMe = (req, res, next) => {
  // The user ID is available in req.user.id
  req.params.id = req.user.id;
  next();
};

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

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

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
    'photo',
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
  await User.findByIdAndDelete(req.user.id);

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
    data: {
      // eslint-disable-next-line no-shadow
      following: user.following.map((user) => ({
        id: user._id,
        name: user.name,
        products: user.products,
        image: user.image,
        phone: user.phone
      }))
    }
  });
});

exports.getFollowingUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('following');

  // Get the user that is being followed
  const followingUser = user.following.find(
    // eslint-disable-next-line no-shadow
    (user) => user.id === req.params.id
  );

  if (!followingUser) {
    return next(
      new AppError('No user found with that ID in your following', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      id: followingUser._id,
      name: followingUser.name,
      products: followingUser.products,
      image: followingUser.image,
      phone: followingUser.phone
    }
  });
});

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
