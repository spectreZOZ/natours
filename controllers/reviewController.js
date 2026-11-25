const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  //  Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.restrictReview = async (req, res, next) => {
  const bookings = await Booking.find({
    user: req.body.user,
    tour: req.body.tour,
  });

  if (!bookings || bookings.length === 0)
    return next(new AppError('You only can review your booked tours!', 403));

  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
