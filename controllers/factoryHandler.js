// const catchAsync = require('express-async-handler');
const slugify = require('slugify');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
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
  catchAsync(async (req, res) => {
    // Create slug Field
    if (Model !== 'User') {
      req.body.slug = slugify(req.body.name, { lower: true });
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
