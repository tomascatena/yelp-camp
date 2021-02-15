const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

// Custom error handling
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.get('/register', (req, res, next) => {
  res.render('users/register');
});

router.post(
  '/register',
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      // method from passport to don't have to login in the user after registration
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', 'Welcome to YelpCamp!');
        res.redirect('/campgrounds');
      });
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/users/register');
    }
  })
);

router.get('/login', (req, res, next) => {
  res.render('users/login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/users/login',
  }),
  (req, res, next) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get('/logout', (req, res, next) => {
  req.logout();
  if (req.user) {
    req.flash('success', 'Goodbye!');
  }
  res.redirect('/campgrounds');
});

module.exports = router;
