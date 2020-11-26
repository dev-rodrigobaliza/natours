const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/AppError');
const errorHandler = require('./controllers/errorController');

const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const authRouter = require('./routes/authRoutes');

const app = express();
//set template engine to html
app.set('view engine', 'pug');
//set template files path
app.set('views', path.join(__dirname, 'views'));
//set static files path
app.use(express.static(path.join(__dirname, 'public')));
//set security http headers
app.use(helmet({ contentSecurityPolicy: false })); //tive que desativar CSP por causa do mapbox
//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requests from same IP
const limiter = rateLimit({
  max: 1,
  windowMs: 1000,
  message: 'too many request from this IP, please try again later',
});
app.use('/api', limiter);
//body parser, read data from body into req.body
app.use(express.json({ limit: '10kb' }));
//cookie parser
app.use(cookieParser());
//data sanitization against nosql query injection
app.use(mongoSanitize());
//data sanitization against xss
app.use(xss());
//prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//custom middleware, register time when req comes and use it to measure total time spent with res
app.use((req, res, next) => {
  req.requestTime = new Date();
  //console.log(req.cookies);
  next();
});
//compress all responses
app.use(compression());
//HTML routes
app.use('/', viewRouter);
//API routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/auth', authRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server...`, 404));
});

app.use(errorHandler);

module.exports = app;
