const stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);
const Tour = require('../models/tourModel');
const responseFormated = require('../utils/responseFormated');
const catchAsync = require('../utils/catchAsync');
const factory = require('../factories/controllerFactory');
const AppError = require('../utils/AppError');

exports.getCheckoutSesison = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const booking = {
    cancel_url: `${req.protocol}://${req.hostname}/tour/${tour.slug}`,
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.hostname}/`,
    client_reference_id: req.params.tourId,
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  };
  const session = await stripe.checkout.sessions.create(booking);
  res
    .status(200)
    .json(responseFormated.responseObject(session, req.requestTime));
});
