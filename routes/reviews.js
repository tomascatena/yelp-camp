const express = require('express');
const router = express.Router({ mergeParams: true });

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  const colors = require('colors');
  router.use(morgan('dev'));
}
// Middlewares
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Custom error handling
const catchAsync = require('../utils/catchAsync');

// Controllers
const reviewControllers = require('../controllers/reviews');

// Joi schema for data validation

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(reviewControllers.createReview)
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewControllers.deleteReview)
);

module.exports = router;
