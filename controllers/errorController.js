const AppError = require('../utils/AppError');

const handleError = (err) => {
  if (err.kind === 'ObjectId') {
    const message = `invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
  }
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `duplicate field value: ${value}`;
    return new AppError(message, 400);
  }
  if (err.errors) {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `invalid input data. ${errors.join('. ')}.`;
    return new AppError(message, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    const message = `invalid token, please log in again!`;
    return new AppError(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = `your token has expired, please log in again!`;
    return new AppError(message, 401);
  }
  const error = { ...err };
  error.message = err.message;
  return error;
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'oops, something went wrong here...',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
    });
  }
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'please try again later...',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    const error = handleError(err);
    sendErrorProd(error, req, res);
  }
};
