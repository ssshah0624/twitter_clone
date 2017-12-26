var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Follow = models.Follow;
var Tweet = models.Tweet;

// THE WALL - anything routes below this are protected by our passport (user must be logged in to access these routes)!
router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

router.get('/', function(req, res) {
  // res.send("Success! You are logged in.");

  req.user.getFollows(function(err, following, followers){
    res.render('singleProfile',{user: req.user, following: following, followers: followers});
  });

  // res.render('singleProfile',{user: req.user});
});

router.get('/users/', function(req, res, next) {
  req.user.getUsers(function(err, users){
    res.render('profiles',{users: users});
  })
});

router.get('/users/:userId', function(req, res, next) {
  // Gets all information about a single user
  var userId = req.params.userId;
  var user = User.findById(userId, function(err,user){
    res.render('singleProfile',{user: user});
  });
});

//SS- handle user follow requests
router.post('/follow/:userid', function(req, res, next){
    req.user.follow(req.params.userid, function(err, result){
      if(err){
        console.log(err);
      }else{
        console.log(result);
        if(result){
          console.log("Follow doc created!");
        }else{
          console.log("Follow doc not created :(");
        }
      }
    });
  res.redirect('/users/'+req.params.userid);
});

router.post('/unfollow/:userid', function(req, res, next){
    req.user.unfollow(req.params.userid, function(err, result){
      if(err){
        console.log(err);
      }else{
        console.log(result);
        if(result){
          console.log("Unfollow doc created!");
        }else{
          console.log("Unfollow doc not created :(");
        }
      }
    });
  res.redirect('/users/'+req.params.userid);
});

router.get('/tweets/', function(req, res, next) {

  // Displays all tweets in the DB

});

router.get('/tweets/:tweetId', function(req, res, next) {

  //Get all information about a single tweet

});

router.get('/tweets/:tweetId/likes', function(req, res, next) {

  //Should display all users who like the current tweet

});

router.post('/tweets/:tweetId/likes', function(req, res, next) {

  //Should add the current user to the selected tweets like list (a.k.a like the tweet)

});

router.get('/tweets/new', function(req, res, next) {

  //Display the form to fill out for a new tweet

});

router.post('/tweets/new', function(req, res, next) {

  // Handle submission of new tweet form, should add tweet to DB


});

module.exports = router;
