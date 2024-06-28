// const catchAsync = require('express-async-handler');
// const slugify = require('slugify');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
// const Subcategory = require('../models/subcategoryModel');
// const Category = require('../models/categoryModel');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Product Checker -> handled in validation layer
    // if (Model.modelName === 'Product') {
    //   //   // Get product data
    //   const product = await Model.findById(id);

    //   // Check if user is the owner of the product
    //   const userID = product.user;
    //   if (userID.toString() !== req.user._id.toString()) {
    //     return next(
    //       new AppError(
    //         'You are not The Owner of this Product to perform This Action !',
    //         403
    //       )
    //     );
    //   }
    // }

    // Comment Checker
    if (Model.modelName === 'Comment') {
      const comment = await Model.findById(id);

      // Check if comment exist
      if (!comment) {
        return next(new AppError(`No Comment for this Id: ${id}`, 404));
      }
      const userID = comment.user;

      // Check if user is the owner of the comment
      if (userID.toString() !== req.user._id.toString()) {
        return next(
          new AppError('You are not allowed to delete this comment!', 403)
        );
      }
    }

    const deletedDoc = await Model.findByIdAndDelete(id);

    if (!deletedDoc) {
      return next(new AppError(`No Document for this Id: ${id}`, 404));
    }

    res.status(204).send();
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Comment Checker
    // if (Model.modelName === 'Comment') {
    //   const comment = await Model.findById(id);

    //   // Check if comment exist
    //   if (!comment) {
    //     return next(new AppError(`No Comment for this Id: ${id}`, 404));
    //   }

    //   // Check if user is the owner of the comment
    //   const userID = comment.user;
    //   if (userID.toString() !== req.user._id.toString()) {
    //     return next(
    //       new AppError('You are not allowed to Update this comment!', 403)
    //     );
    //   }
    // }

    const doc = await Model.findByIdAndUpdate(
      id, // id of the document to update
      req.body, // data to update
      { new: true } // to return Model after updating
    );

    if (!doc) {
      return next(
        new AppError(`No Document for this Id: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      message: 'success',
      data: doc
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.body);
    // console.log(Model);
    // console.log(Model.modelName);

    // Adding Product Owner to the body of the request to Create Product
    if (Model.modelName === 'Product') {
      req.body.owner = req.user.id;
    }

    const doc = await Model.create(req.body);

    res.status(201).json({ message: 'success', date: doc });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id).populate(popOptions);

    if (!doc) {
      return next(new AppError(`No Document for this Id: ${id}`, 404));
    }

    res.status(200).json({
      message: 'success',
      data: doc
    });
  });

exports.getAll = (Model, modelName = '') =>
  catchAsync(async (req, res) => {
    // Filter Object for Nested Routes
    // If Nested Route, filter by Parent Id
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    // Build Query
    const docsCounter = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(docsCounter)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Excute Query
    const { query, paginationRes } = apiFeatures;
    const docs = await query;

    res.status(200).json({
      message: 'success',
      results: docs.length,
      paginationRes,
      data: docs
    });
  });
