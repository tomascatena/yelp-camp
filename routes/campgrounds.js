const express = require('express');
const router = express.Router();

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const morgan = require('morgan');

// Custom error handling
const catchAsync = require('../utils/catchAsync');

// Controllers
const campgroundsControllers = require('../controllers/campgrounds');

// Middlewares
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  router.use(morgan('dev'));
}

router
  .route('/')
  .get(catchAsync(campgroundsControllers.index))
  .post(
    isLoggedIn,
    validateCampground,
    catchAsync(campgroundsControllers.createCampground)
  );

// /new must be before /:id
router.get('/new', isLoggedIn, campgroundsControllers.renderNewForm);

router
  .route('/:id')
  .get(catchAsync(campgroundsControllers.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgroundsControllers.updateCampground)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundsControllers.deleteCampground)
  );

router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundsControllers.renderEditForm)
);

module.exports = router;
