const mongoose = require('mongoose');
const campground = require('../models/campground');
const Campground = require('../models/campground');

const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const descriptionText =
  'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptatem libero, expedita sapiente quo incidunt ad qui? Sint fuga quia asperiores';

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 15) + 15;
    const camp = new Campground({
      author: '602a8cc8d6e54b01d8019d88',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: descriptionText,
      price,
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
