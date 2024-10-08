const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { updateUserValidator } = require('../utils/validators/userValidator');

const {
  uploadUserImage,
  resizeImage,
  uploadImageToCloudinary
} = require('../controllers/userController');

const {
  createFilterOpj,
  getAllProducts
} = require('../controllers/productController');

const router = express.Router({ mergeParams: true });

router.use('/:userId/products', require('./productRoutes'));

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.get(
  '/myProducts',
  authController.protect,
  userController.getMyProducts,
  createFilterOpj,
  getAllProducts
);

router.patch(
  '/updateMe',
  authController.protect,
  uploadUserImage,
  updateUserValidator,
  resizeImage,
  uploadImageToCloudinary,
  userController.updateMe
);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/follow')
  .get(authController.protect, userController.getAllFollowingUsers);

router
  .route('/follow/:id')
  //.get(authController.protect, userController.getFollowingUser)
  .patch(authController.protect, userController.followUser)
  .delete(authController.protect, userController.unfollowUser);

router
  .route('/favorite')
  .get(authController.protect, userController.getAllFavoriteItems);

router
  .route('/favorite/:id')
  //.get(authController.protect, userController.getFavoriteItem)
  .patch(authController.protect, userController.favoriteItem)
  .delete(authController.protect, userController.unfavoriteItem);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.changeRole
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
