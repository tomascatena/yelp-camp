const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary/index');

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  const colors = require('colors');
}

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
    upload.array('images', 4),
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
    upload.array('images', 4),
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
