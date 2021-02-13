const path = require('path');
const dotenv = require('dotenv');

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');

const morgan = require('morgan');
const color = require('colors');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// Connect to DB
connectDB();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res, next) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res, next) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id', async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});

const port = process.env.PORT || 3000;
app.listen(port, (req, res, next) => {
  console.log(`Server running on port ${port}`.black.bgYellow.bold);
});
