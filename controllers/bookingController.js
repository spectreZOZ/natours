const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the current booked tour
  const targetDate = new Date(req.params.selectedDate);

  // Optional: Guard against malformed date strings in the URL
  if (Number.isNaN(targetDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // ) Check if the user already booked the tour on the specific date

  const bookings = await Booking.find({
    user: req.user.id,
    tour: req.params.tourId,
    reservedDate: targetDate,
  });

  if (bookings && bookings.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: `You already booked this tour on ${targetDate.toDateString()}`,
    });
  }

  const tour = await Tour.findOne({
    _id: req.params.tourId,
    startDates: {
      $elemMatch: {
        date: targetDate,
        soldOut: { $ne: true },
      },
    },
  });

  if (!tour) {
    return res.status(404).json({
      status: 'error',
      message: 'Date is either unavailable or sold out',
    });
  }

  // 2) Create checout session
  const session = await stripe.checkout.sessions.create({
    allowed_payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}&reservedDate=${req.params.selectedDate}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
          currency: 'usd',
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //  This is only temporary, because it's unsecure: everyone can make bookings without paying
  const { tour, user, price, reservedDate } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({
    tour,
    user,
    price,
    reservedDate,
  });

  await Tour.findOneAndUpdate(
    {
      _id: tour,
      'startDates.date': reservedDate,
      'startDates.soldOut': { $ne: true },
    },
    {
      $inc: {
        'startDates.$.participants': 1,
      },
    },
    {
      new: true,
    },
  );

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
