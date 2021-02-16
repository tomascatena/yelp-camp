const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const usersController = require('../controllers/users');

// Custom error handling
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router
  .route('/register')
  .get(usersController.renderRegister)
  .post(catchAsync(usersController.register));

router
  .route('/login')
  .get(usersController.renderLogin)
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/users/login',
    }),
    usersController.login
  );

router.get('/logout', usersController.logout);

module.exports = router;
