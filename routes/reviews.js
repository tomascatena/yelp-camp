const express = require('express');
const router = express.Router({ mergeParams: true });

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const morgan = require('morgan');

// Middlewares
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Custom error handling
const catchAsync = require('../utils/catchAsync');

// Controllers
const reviewControllers = require('../controllers/reviews');

// Joi schema for data validation

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  router.use(morgan('dev'));
}

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
