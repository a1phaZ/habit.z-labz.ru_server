const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.static(__dirname, {dotfiles: 'allow'}));

app.disable('x-powered-by');

require('./config/db');
const {handleError, createError} = require("./handlers/error");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(require('./handlers/compareSign'));

app.use(require('./routes'));

app.use(function (req, res, next) {
	next(createError(404, 'Запрашиваемый адрес не найден'));
});

// error-box handler
app.use((err, req, res, next) => {
	handleError(err, res)
});

http.createServer(app).listen(80, () => {
	console.log('Listening HTTP...');
});

module.exports = app;