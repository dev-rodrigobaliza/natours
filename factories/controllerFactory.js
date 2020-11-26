const responseFormated = require('../utils/responseFormated');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res
      .status(201)
      .json(responseFormated.responseObject(document, req.requestTime));
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(
        new AppError(`no document found with ID ${req.params.id}`, 404)
      );
    }
    res
      .status(200)
      .json(responseFormated.responseObject(document, req.requestTime));
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new AppError(`no document found with ID ${req.params.id}`, 404)
      );
    }
    res
      .status(204)
      .json(responseFormated.responseObject(null, req.requestTime));
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const document = await query;
    if (!document) {
      return next(
        new AppError(`no document found with ID ${req.params.id}`, 404)
      );
    }
    res
      .status(200)
      .json(responseFormated.responseObject(document, req.requestTime));
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allow nested get reviews on tour
    let filter = {};
    if (req.params.tourId)
      filter = {
        tour: req.params.tourId,
      };
    //common use
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    //const document = await features.query.explain();  //show details about the query and not the documents
    const document = await features.query;
    res
      .status(200)
      .json(responseFormated.responseArray(document, req.requestTime));
  });
