const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const companyRouter = require('./routes/company');
const roleRouter = require('./routes/role');
const carRouter = require('./routes/cars');
const mobileRouter = require('./routes/mobile');
const trainNoteRouter = require('./routes/trainNote')

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1/api', express.static('public'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/company',companyRouter);
app.use('/role',roleRouter);
app.use('/cars',carRouter);
app.use('/mobile',mobileRouter);
app.use('/trainNote',trainNoteRouter);

module.exports = app;
