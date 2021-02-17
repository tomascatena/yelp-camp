// Load env vars
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config({ path: './config/config.env' });
}

const path = require('path');
const connectDB = require('./config/db');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const localStrategy = require('passport-local');
const EspressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);

// Models
const User = require('./models/user');

// Routes
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

// Dev tools
const morgan = require('morgan');
const colors = require('colors');

const app = express();

app.use(helmet());

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com',
  'https://bootswatch.com',
];
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com',
];
const fontSrcUrls = ['https://fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ['blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/catena-cloudinary/',
        'https://images.unsplash.com',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Connect to DB
connectDB();

app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

const store = new MongoDBStore({
  url: process.env.MONGO_URI,
  secret: process.env.SESSION_SECRET,
  touchAfter: 24 * 3600,
});

store.on('error', function (e) {
  console.log('Session Store Error', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // secure: true,
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// ######### PASSPORT #########
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // How to store a user into a session
passport.deserializeUser(User.deserializeUser()); // How to get a user out of a session
// ############################

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// For every single request, take what is under 'success'
// and have access to it in the locals under the key 'success'
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/users', usersRoutes);

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root URL
app.get('/', (req, res, next) => {
  res.render('home');
});

app.get('/fakeUser', async (req, res, next) => {
  const user = new User({ email: 'colt@gmail.com', username: 'colttt' });
  const newUser = await User.register(user, 'chicken');
  res.send(newUser);
});

// For rotues not defined above
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, (req, res, next) => {
  console.log(`Server running on port ${port}`.black.bgYellow.bold);
});
