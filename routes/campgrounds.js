const express = require('express');
const router = express.Router();

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const morgan = require('morgan');

// Custom error handling
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// Mongoose model
const Campground = require('../models/campground');

// Joi schema for data validation
const { campgroundSchema } = require('../schemas');

// Middlewares
const { isLoggedIn } = require('../middleware');

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  router.use(morgan('dev'));
}

// Middleware to validate the req.body with Joi
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  '/',
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

router.get('/new', isLoggedIn, (req, res, next) => {
  res.render('campgrounds/new');
});

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    );
    if (!campground) {
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  })
);

router.get(
  '/:id/edit',
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
  })
);

router.put(
  '/:id',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    if (!campground) {
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  '/:id',
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds/');
  })
);

module.exports = router;
