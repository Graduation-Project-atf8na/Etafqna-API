const factory = require('./factoryHandler');
const Comment = require('../models/commentModel');

// Nested route
// GET /api/v1/products/:productId/comments
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// Nested route (Create)
// POST /api/v1/products/:productId/comments
exports.setProductIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  next();
};

exports.setUserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// @desc    Get list of comments
// @route   GET /api/v1/comments
// @access  Public
exports.getAllComments = factory.getAll(Comment);

// @desc    Get specific comment by id
// @route   GET /api/v1/comments/:id
// @access  Public
exports.getComment = factory.getOne(Comment);

// @desc    Create comment
// @route   POST  /api/v1/comments
// @access  Private/Protect/User
exports.createComment = factory.createOne(Comment);

// @desc    Update specific comment
// @route   PUT /api/v1/comments/:id
// @access  Private/Protect/User
exports.updateComment = factory.updateOne(Comment);

// @desc    Delete specific comment
// @route   DELETE /api/v1/comments/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteComment = factory.deleteOne(Comment);
