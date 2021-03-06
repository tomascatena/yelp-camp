// Load env vars
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config({ path: './config/config.env' });
}
const colors = require('colors');

// Mapbox geocoding
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapBoxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const mongoose = require('mongoose');
const Campground = require('../models/campground');

// const cities = require('./cities');
const cities = require('./cities-de');
const { places, descriptors } = require('./seedHelpers');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(
    `MongoDB Connected for seeder: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
      .red.bold.underline
  );
};
connectDB();

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const descriptionText =
  'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptatem libero, expedita sapiente quo incidunt ad qui? Sint fuga quia asperiores';

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 200; i++) {
    const randomIndex = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 15) + 15;
    const location = `${cities[randomIndex].city}, ${cities[randomIndex].state}`;

    // const geoData = await geocoder
    //   .forwardGeocode({
    //     query: location,
    //     limit: 1,
    //   })
    //   .send();
    // geometry = geoData.body.features[0].geometry;

    const camp = new Campground({
      author: '602d4f9d2e8dff4ea8d594c5',
      location,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: descriptionText,
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[randomIndex].longitude,
          cities[randomIndex].latitude,
        ],
      },
      images: [
        {
          url:
            'https://res.cloudinary.com/catena-cloudinary/image/upload/v1613501449/YelpCamp/jao5vgwtfm7knnxgxiqz.jpg',
          filename: 'YelpCamp/jao5vgwtfm7knnxgxiqz',
        },
        {
          url:
            'https://res.cloudinary.com/catena-cloudinary/image/upload/v1613501503/YelpCamp/ekeds4ztgwfmavofgmq5.jpg',
          filename: 'YelpCamp/ekeds4ztgwfmavofgmq5',
        },
        {
          url:
            'https://res.cloudinary.com/catena-cloudinary/image/upload/v1613501504/YelpCamp/ts9ftcocsccf7mpz0ssr.jpg',
          filename: 'YelpCamp/ts9ftcocsccf7mpz0ssr',
        },
        {
          url:
            'https://res.cloudinary.com/catena-cloudinary/image/upload/v1613501501/YelpCamp/braxqnthzoyfatarh55j.jpg',
          filename: 'YelpCamp/braxqnthzoyfatarh55j',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
