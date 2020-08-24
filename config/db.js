const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});

mongoose.Promise = global.Promise;

const dbPath = process.env.MONGODB_URI || `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_PATH}:${process.env.MONGO_PORT}/${process.env.MONGO_BASE}?authSourse=${process.env.MONGO_BASE}`;

mongoose.connect(dbPath, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.connection.on('connected', () =>
  console.log(`MongoDB connection established successfully`),
);
mongoose.connection.on('disconnected', () =>
  console.log(`MongoDB connection close`),
);
mongoose.connection.on(`error`, (e) => {
  console.log(`MongoDB connection error`, e);
  process.exit();
});

exports.module = mongoose;