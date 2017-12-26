var express = require('express');
var session = require('express-session')
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var models = require('./models/models')
var routes = require('./routes/index');
var auth = require('./routes/auth');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//Crypto - SS
var crypto = require('crypto');
function hashPassword(password){
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// Passport stuff here
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Session info here
app.use(session({ 
  secret: 'sunny is da best', 
  store: new MongoStore({mongooseConnection: require('mongoose').connection}),
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Serialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

// Passport Deserialize
passport.deserializeUser(function(id, done) {
  models.User.findById(id, function(err,user){
    done(err, user);
  });
});

// Passport Strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("USERNAME -> ",username);
    models.User.findOne({email: username}, function(err, user){
      if(user){
        console.log("USER -> ",user);
        console.log("Local strategy: ",user.password);
        if(user && user.password === hashPassword(password)){
          console.log("What up fam: ", user);
          done(null, user);
        }else{
          done(null,false);
        }
      }else{
        done(null,false);
      }
   });
  }
));


app.use('/', auth(passport));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
