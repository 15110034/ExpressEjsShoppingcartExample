var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require("express-handlebars");
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var mongoose = require("mongoose");
var config = require("./config/index.js");
var session = require("express-session");
var bodyParser = require("body-parser");
var passport = require("passport");
var flash = require("connect-flash"); // xem cai nay 
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);//xem cai nay 


var app = express();


mongoose.connect(config.getDbConnectiongString());
require('./config/passport.js'); // thực thi cái phần cáu hình của passport . thực thi hết mấy cái function trong đó 
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' })); // co the app.engine('.hbs',expressHbs()); hiển thị layout theo ý muốn , xem trong file index.js sẽ hiểu , chỗ render ....
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
// trong bài này thì khi đăng nhập vào nó tạo ra session lưu trữ thông tin user (theo passport ** xem trong file passport.js ). req.user,khi log out thì nó xóa session của user ; ta cũng phải lưu trữ 1 session cho cart ,xem ở phần add-to-cart . cookie lưu trữ id của session và có thười gian sống ,nếu cookie chết thì session cũng không còn 
app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection:mongoose.connection}), // in part add a store session 
  cookie:{maxAge:180*60*1000}
})); // passport sẽ lưu các token vào các session và dữ liệu session sẽ được lưu vào cookie 
app.use(flash());// khởi tạo module flash , module này chỉ đơn giản hỗ trợ hiển thị các câu thông báo, nó được lưu trong session ở trên trong database  
app.use(passport.initialize()); // khởi tạo module passport  //phải đặt sau use middleware express-session
app.use(passport.session()); //bật tính năng sử dụng session //phải đặt sau use middleware express-session , passport được lưu trong session ở trên trong database  
app.use(express.static(path.join(__dirname, 'public')));

//cai nay sau khi viet ham isLoggedIn
app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated(); //xem cais nay

  res.locals.session = req.session;
  next();
})

app.use('/', indexRouter);
app.use('/user', userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
