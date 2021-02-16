const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().max(100),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().max(150),
    description: Joi.string().required().max(1000),
  }).required(),
  deleteImages: Joi.array().max(5),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().max(200),
  }).required(),
});
