const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose');
const dotenv = require('dotenv');
const qs = require('querystring');
const crypto = require('crypto');

dotenv.config();

const app = express();

app.use(express.static(__dirname, {dotfiles: 'allow'}));

app.disable('x-powered-by');

require('./config/db');
const {handleError, createError} = require("./handlers/error");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use((req, res, next) => {
	const params = req.query;
	const ordered = {};
	Object.keys(params).sort().forEach((key) => {
		if (key.slice(0, 3) === 'vk_') {
			ordered[key] = params[key];
		}
	});
	const stringParams = qs.stringify(ordered);
	const paramsHash = crypto
		.createHmac('sha256', process.env.APP_VK)
		.update(stringParams)
		.digest()
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=$/, '');
	if (paramsHash === params.sign) {
		next();
	} else {
		next(createError(403, 'Ошибка параметров подписи'));
	}
});

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