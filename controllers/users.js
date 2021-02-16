// Mongoose model
const User = require('../models/user');

module.exports.renderRegister = (req, res, next) => {
  res.render('users/register');
};

module.exports.register = async (req, res, next) => {
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
};

module.exports.renderLogin = (req, res, next) => {
  res.render('users/login');
};

module.exports.login = (req, res, next) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout();
  if (req.user) {
    req.flash('success', 'Goodbye!');
  }
  res.redirect('/campgrounds');
};
