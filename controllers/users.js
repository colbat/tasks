var User = require('../models/User');

module.exports = {

  saveUser: function(user, callback) {
    var user = new User(user);
    user.save(function(err, user) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, user);
    });
  },

  getUsers: function(callback) {
    User.find(null, '+password', function(err, users) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, users);
    });
  },

  getUser: function(id, callback) {
    User.findById(id, '+password', function(err, user) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, user);
    });
  },

  getUserByEmail: function(email, callback) {
    User.findOne({email: email}, '+password', function(err, user) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, user);
    });
  },

  getUserByFacebookProfileId: function(id, callback) {
    User.findOne({'facebook.profileId': id}, function(err, user) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, user);
    });
  },

  getUserByTwitterProfileId: function(id, callback) {
    User.findOne({'twitter.profileId': id}, function(err, user) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, user);
    });
  },

  deleteUser: function(id, callback) {
    User.findOneAndRemove({_id: id}, function(err, user) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, user);
    });
  }

};