const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('morgan');
global.cronScheduleList = [];

dotenv.config();

const app = express();

app.use(express.static(__dirname, {dotfiles: 'allow'}));

app.disable('x-powered-by');

require('./config/db');
const {fillAndStartSchedule} = require("./handlers/cron");
const {handleError, createError} = require("./handlers/error");

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('static'));
app.use(require('./handlers/compareSign'));
app.use(require('./handlers/updateNotification'));

app.use(require('./routes'));

app.use(function (req, res, next) {
  next(createError(404, 'Запрашиваемый адрес не найден'));
});

// error-box handler
app.use((err, req, res, next) => {
  handleError(err, res)
});

http.createServer(app).listen(process.env.PORT_HTTP, () => {
  fillAndStartSchedule()
  console.log('Listening HTTP...');
});

module.exports = app;