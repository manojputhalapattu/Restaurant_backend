var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const mongoose = require('mongoose');
var configure = require('./configure');
const url = configure.mongoUrl;
const connect = mongoose.connect(url);
var FileStore = require('session-file-store')(session)
var passport = require('passport');
var authenticate = require('./authenticate')





connect.then((db)=>{
  console.log("connected to the DB SUCCESFULLY");
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter')
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter')
var app = express();
app.all('*',(req,res,next)=>{
  if (req.secure){
    return next();
  }
  else{
    res.redirect(307, 'https://'+ req.hostname + ':' + app.get('secPort') + req.url)
  }
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('1234-5678-01234'));

// app.use(session({
//   name :'session-id',
//   secret :'1234-5678-01234',
//   saveUninitialized :false,
//   resave:false,
//   store: new FileStore()
// }))
// https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTk1NTYzNDhlNmViYTVhZWM2ODczMDciLCJpYXQiOjE1ODY4NDUyNjQsImV4cCI6MTU4Njg0ODg2NH0.1RCyFW4YAzidGpCMiMxvkK-sZ5Ib0pUTTDS-TotT5L4
 app.use(passport.initialize());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static('public'))
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageUpload',uploadRouter)

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
