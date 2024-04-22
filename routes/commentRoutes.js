const express = require('express');

const {
  getAllComments,
  getComment,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

const authController = require('../controllers/authController');

const router = express.Router();

// Nested Route
// Enable Create Comment /Get All Comments in Product
// router.use('/:productId/comments', productRoute);

router
  .route('/')
  .get(getAllComments)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    createComment
  );

router
  .route('/:id')
  .get(getComment)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    updateComment
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    deleteComment
  );

module.exports = router;
