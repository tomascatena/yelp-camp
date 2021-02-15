const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Custom error message for duplicate email
UserSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already taken'));
  } else {
    next(error);
  }
});

// Is adding a username, has and salt field to store the username,
// the hasehd password and the salt value.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
