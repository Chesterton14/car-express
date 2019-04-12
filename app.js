var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const connection = require('./db/DBConfig');
connection.connect()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var companyRouter = require('./routes/company');
var roleRouter = require('./routes/role');
var carRouter = require('./routes/cars');
var mobileRouter = require('./routes/mobile');

var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use('*',function (req, res, next) {
    //设置跨域
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});*/


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/company',companyRouter);
app.use('/role',roleRouter);
app.use('/cars',carRouter);
app.use('/mobile',mobileRouter);

module.exports = app;
