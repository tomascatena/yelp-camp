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

// Import mongoose models
const Review = require('../models/review');
const Campground = require('../models/campground');

// Joi schema for data validation

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  router.use(morgan('dev'));
}

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
