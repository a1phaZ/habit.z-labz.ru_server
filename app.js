const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('morgan');

dotenv.config();

const app = express();

app.use(express.static(__dirname, {dotfiles: 'allow'}));

app.disable('x-powered-by');

require('./config/db');
const {handleError, createError} = require("./handlers/error");

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('static'));
app.use(require('./handlers/compareSign'));

app.use(require('./routes'));

app.use(function (req, res, next) {
	next(createError(404, 'Запрашиваемый адрес не найден'));
});

// error-box handler
app.use((err, req, res, next) => {
	handleError(err, res)
});

if (process.env.SSL_PRIVATE_KEY_PATH && process.env.SSL_CERTIFICATE_PATH) {
	https.createServer({
		key: fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH),
		cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH)
	}, app).listen(process.env.PORT_HTTPS || 8080, () => {
		console.log('Listening HTTPS...');
	});
}

http.createServer(app).listen(process.env.PORT_HTTP, () => {
	console.log('Listening HTTP...');
});

module.exports = app;