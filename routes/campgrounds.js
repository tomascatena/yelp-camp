const express = require('express');
const router = express.Router();

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const morgan = require('morgan');

// Custom error handling
const catchAsync = require('../utils/catchAsync');

// Mongoose model
const Campground = require('../models/campground');

// Middlewares
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  router.use(morgan('dev'));
}

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
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'author',
        },
      })
      .populate('author');
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
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

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
  isAuthor,
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
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds/');
  })
);

module.exports = router;
