const sharp = require('sharp/');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const responseFormated = require('../utils/responseFormated');
const AppError = require('../utils/AppError');
const upload = require('../utils/uploadPhoto');
const factory = require('../factories/controllerFactory');

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password update!', 400));
  }
  const update = filterObj(req.body, 'name', 'email');
  if (req.file) update.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });
  res.status(200).json(responseFormated.responseObject(user, req.requestTime));
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json(responseFormated.responseObject(null, req.requestTime));
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); //do not update password here!!! it will not be encrypted by middleware
exports.deleteUser = factory.deleteOne(User);
