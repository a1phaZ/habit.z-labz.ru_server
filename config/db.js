const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});

mongoose.Promise = global.Promise;

const dbPath = process.env.MONGODB_URI;

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