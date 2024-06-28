// const catchAsync = require('express-async-handler');
// const slugify = require('slugify');
const cloudinary = require('cloudinary').v2;

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

const Product = require('../models/productModel');
// const Subcategory = require('../models/subcategoryModel');
// const Category = require('../models/categoryModel');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    console.log(id);

    // before delete any user,
    // check if the user own any product, delete products first
    // if (Model.modelName === 'User') {
    //   console.log('User Model');
    //   // Check if user own products
    //   const products = await Product.find({ owner: id }).select(
    //     '_id imageCover images'
    //   );
    //   if (products.length > 0) {
    //     products.forEach(async (product) => {
    //       // Delete Product Image Cover
    //       console.log(
    //         'product image cover publicID ',
    //         product.imageCover.public_id
    //       );
    //       await cloudinary.uploader.destroy(product.imageCover.public_id);

    //       // Delete Product Images
    //       if (product.images.length > 0) {
    //         product.images.forEach(async (image) => {
    //           await cloudinary.uploader.destroy(image.public_id);
    //         });
    //       }
    //       // Delete Product document from DB
    //       await Product.findByIdAndDelete(product._id);
    //     });
    //   }
    // }

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
