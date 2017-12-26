var mongoose = require('mongoose');

// Step 0: Remember to add your MongoDB information in one of the following ways!
if (! process.env.MONGODB_URI) {
  console.log('Error: MONGODB_URI is not set. Did you run source env.sh ?');
  process.exit(1);
}

var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    default: 'https://horizons-static.s3.amazonaws.com/horizons_h.png'
  },
  displayName: {
    type: String,
  },
  bio: {
    type: String,
  }
  /* Add other fields here */
});

//For get all users - SS
userSchema.methods.getUsers = function(callback){
  User.find({}).exec(function(err, users){
    callback(false, users);
  });
}

userSchema.methods.getFollows = function (callback){
  Follow.find({follower: this._id}).populate('following').exec(function(err, peopleImFollowing){
    Follow.find({following: this._id}).populate('follower').exec(function(err, peopleFollowingMe){
      callback(false, peopleImFollowing, peopleFollowingMe);
    }.bind(this))
  }.bind(this))
}


userSchema.methods.follow = function (idToFollow, callback){
  // console.log("I am ", this._id, " and I want to follow ", idToFollow);
  var loggedInUserId = this._id;
  Follow.find({follower:loggedInUserId, following:idToFollow}, function(err, found){
    if(err){
      console.log("Error in .follow:", err)
      callback(false,false);
    }else if(found.length===0){
      var followDoc = new Follow({follower:loggedInUserId, following:idToFollow});
      followDoc.save(function(err){
        if(err){
          console.log("Could not save new Follow Doc!");
        }else{
          console.log("Successfully saved Follow doc! Check it out")
        }
      });
      callback(false,true);
    }else{
      console.log("Could not follow because...this relationship exists!");
      callback(false,false);
    }
  });
}

userSchema.methods.unfollow = function (idToUnfollow, callback){
  var loggedInUserId = this._id;
  Follow.find({follower:loggedInUserId, following:idToUnfollow}, function(err, found){
    if(err){
      console.log("Error in .unfollow", err);
      callback(false, false);
    }else if(found.length===0){
      console.log("Could not unfollow because...there is no relationship to begin with");
      callback(false,false);
    }else{
      Follow.find({follower:loggedInUserId, following:idToUnfollow}).remove().exec();
      console.log("Unfollowed!");
      callback(false, true);
    }
  });
}

userSchema.methods.getTweets = function (callback){
  Tweet.find({author: this._id}).exec(function(err, tweets){
    callback(false, tweets);
  });
}

var FollowsSchema = mongoose.Schema({
  follower:{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  following:{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
});

userSchema.methods.newTweet = function (author, content, callback){
  var tweet = new Tweet({author: author, content: content});
  tweet.save(function(err){
      if(err){
        console.log("Could not save new tweet");
        callback(false, false);
      }else{
        console.log("Successfully saved tweet!")
        callback(false, true);
      }
    });
}


var tweetSchema = mongoose.Schema({
  author:{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  content:{
    type: String,
    maxLength: 140,
    required: true
  }
});

tweetSchema.methods.numLikes = function (tweetId, callback){

}


var User = mongoose.model('User', userSchema);
var Tweet = mongoose.model('Tweet', tweetSchema);
var Follow = mongoose.model('Follow', FollowsSchema);

module.exports = {
  User: User,
  Tweet: Tweet,
  Follow: Follow
};
