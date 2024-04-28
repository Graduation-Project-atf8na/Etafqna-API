const express = require('express');

const {
  getAllComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,

  // Nested route
  createFilterObj,
  setProductIdToBody,
  setUserIdToBody
} = require('../controllers/commentController');

const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(createFilterObj, getAllComments)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    setProductIdToBody,
    setUserIdToBody,
    createComment
  );

router
  .route('/:id')
  .get(getComment)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    setUserIdToBody,
    updateComment
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    deleteComment
  );

module.exports = router;
