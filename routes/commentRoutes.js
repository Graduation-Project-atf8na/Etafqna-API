const express = require('express');

const {
  getAllComments,
  getComment,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// const productRoute = require('./productRoutes');

const router = express.Router();

// Nested Route
// Enable Create Comment /Get All Comments in Product
// router.use('/:productId/comments', productRoute);

router.route('/').get(getAllComments).post(createComment);

router.route('/:id').get(getComment).patch(updateComment).delete(deleteComment);

module.exports = router;
