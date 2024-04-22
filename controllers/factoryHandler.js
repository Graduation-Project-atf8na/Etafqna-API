// const catchAsync = require('express-async-handler');
const slugify = require('slugify');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
// const Subcategory = require('../models/subcategoryModel');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (Model.modelName === 'Product') {
      // Get product data
      const product = await Model.findById(id);
      if (!product) {
        return next(new AppError(`No Document for this Id: ${id}`, 404));
      }
      const userID = product.user;
      // Check if user is the owner of the product
      if (userID.toString() !== req.user._id.toString()) {
        return next(
          new AppError('You are not allowed to delete this product!', 403)
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
    // Update slug if Name Field Updated and Model is not User
    if (Model !== 'User' && req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true });
    }

    // check if all subcategories are belong to exsit category in req.body
    // if (Model === 'Product' && req.body.subcategories) {
    //   const subcategoriesIdsInBody = req.body.subcategories.split(',');
    //   console.log(subcategoriesIdsInBody);

    //   // Get all subcategories in DB that belong to category in request
    //   const subObj = Subcategory.find({
    //     category: req.body.category
    //   });

    //   const subcategoriesIdsInDB = subObj.map((sub) => sub._id.toString());
    //   console.log(subcategoriesIdsInDB);

    //   const isSubcategoriesBelongToCategory = subcategoriesIdsInBody.every(
    //     (sub) => subcategoriesIdsInDB.includes(sub)
    //   );

    //   let notIncludedValues = [];
    //   notIncludedValues = subcategoriesIdsInBody.filter(
    //     (value) => !subcategoriesIdsInDB.includes(value)
    //   );
    //   // console.log(`not includes: ${notIncludedValues}`);

    //   if (!isSubcategoriesBelongToCategory) {
    //     return next(
    //       new AppError(
    //         `Subcategory: ${notIncludedValues} not belong to Category!`,
    //         400
    //       )
    //     );
    //   }
    // }

    const doc = await Model.findByIdAndUpdate(
      req.params.id, // id of the document to update
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
    // Create slug Field

    if (Model !== 'User' && req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true });
    }

    // check if all subcategories are belong to exsit category in req.body
    // if (Model === 'Product' && req.body.subcategories) {
    //   const subcategoriesIdsInBody = req.body.subcategories.split(',');
    //   console.log(subcategoriesIdsInBody);

    //   // Get all subcategories in DB that belong to category in request
    //   const subObj = await Subcategory.find({
    //     category: req.body.category
    //   }).select('_id');

    //   const subcategoriesIdsInDB = subObj.map((sub) => sub._id.toString());
    //   console.log(subcategoriesIdsInDB);

    //   // console.log(req.body.category);

    //   const isSubcategoriesBelongToCategory = subcategoriesIdsInBody.every(
    //     (sub) => subcategoriesIdsInDB.includes(sub)
    //   );

    //   let notIncludedValues = [];
    //   notIncludedValues = subcategoriesIdsInBody.filter(
    //     (value) => !subcategoriesIdsInDB.includes(value)
    //   );
    //   // console.log(`not includes: ${notIncludedValues}`);

    //   if (!isSubcategoriesBelongToCategory) {
    //     return next(
    //       new AppError(
    //         `Subcategory: ${notIncludedValues} not belong to Category!`,
    //         400
    //       )
    //     );
    //   }
    // }

    // check if all subcategories are belong to exsit category in req.body
    // if (Model === 'Product') {
    //   const subcategoriesIdsInBody = req.body.subcategories.split(',');
    //   console.log(subcategoriesIdsInBody);

    //   // Get all subcategories in DB that belong to category in request
    //   const subObj = Subcategory.find({
    //     category: req.body.category
    //   });

    //   const subcategoriesIdsInDB = subObj.map((sub) => sub._id.toString());
    //   console.log(subcategoriesIdsInDB);

    //   const isSubcategoriesBelongToCategory = subcategoriesIdsInBody.every(
    //     (sub) => subcategoriesIdsInDB.includes(sub)
    //   );

    //   let notIncludedValues = [];
    //   notIncludedValues = subcategoriesIdsInBody.filter(
    //     (value) => !subcategoriesIdsInDB.includes(value)
    //   );
    //   // console.log(`not includes: ${notIncludedValues}`);

    //   if (!isSubcategoriesBelongToCategory) {
    //     return next(
    //       new AppError(
    //         `Subcategory: ${notIncludedValues} not belong to Category!`,
    //         400
    //       )
    //     );
    //   }
    // }

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
    const docsCouter = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(docsCouter)
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
