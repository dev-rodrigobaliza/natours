const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const responseFormated = require('../utils/responseFormated');
const Email = require('../utils/email');

function getJWT(payload) {
  let expires;
  if (process.env.NODE_ENV === 'development') {
    expires = process.env.JWT_EXPIRES_DEV;
  } else if (process.env.NODE_ENV === 'production') {
    expires = process.env.JWT_EXPIRES_PROD;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });
}

function getCookieExpires() {
  let expires;
  if (process.env.NODE_ENV === 'development') {
    expires = process.env.JWT_COOKIE_EXPIRES_IN_DEV;
  } else if (process.env.NODE_ENV === 'production') {
    expires = process.env.JWT_COOKIE_EXPIRES_IN_PROD;
  }
  return new Date(Date.now() + expires * 24 * 60 * 60 * 1000);
}

function createSendToken(statusCode, user, res) {
  const token = getJWT({ id: user._id });
  const cookieOptions = {
    expires: getCookieExpires(),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  const data = {
    name: user.name,
    email: user.email,
  };
  res.status(statusCode).json(responseFormated.responseToken(token, data));
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/login?next=me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(201, newUser, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('inform email and password!', 400));
  }
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('wrong email and/or password!', 401));
  }
  createSendToken(200, user, res);
});

exports.logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'loggedout', cookieOptions);
  res.status(200).json(responseFormated.responseSuccess());
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('you are not logged in, please log in to get access!', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        'the user in this token is not valid, please log in to get access!',
        401
      )
    );
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'the password in this token is not valid, please log in to get access!',
        401
      )
    );
  }
  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const user = await User.findById(decoded.id);
      if (!user) {
        return next();
      }
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = user;
    }
  } catch (error) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action!', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('user not found with this email!', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res
      .status(200)
      .json(responseFormated.responseMessage('Token sent to your email!'));
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'there was an error sending the email, try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('inform password and passwordConfirm!', 400));
  }
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('token is expired or invalid!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(200, user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  if (
    !req.body.password ||
    !req.body.passwordNew ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError('inform password, passwordNew and passwordConfirm!', 400)
    );
  }
  if (req.body.password === req.body.passwordNew) {
    return next(
      new AppError(
        'the new password must be different from the old password!',
        400
      )
    );
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError('wrong password!', 401));
  }
  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(200, user, res);
});
