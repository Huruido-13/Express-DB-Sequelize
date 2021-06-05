//HTTPエラーの対処
var createError = require('http-errors');
//Express本体
var express = require('express');
//ファイルパスを扱う
var path = require('path');
//クッキーのパース
var cookieParser = require('cookie-parser');
//HTTPリクエストのログ出力に関するモジュール
var logger = require('morgan');
//セッション機能を利用する
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var hello = require('./routes/hello');
var mydtb = require('./routes/mydtb')

var app = express();

var session_opt = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:60*60*1000}
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(session_opt))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hello', hello);
app.use('/mydtb', mydtb);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
