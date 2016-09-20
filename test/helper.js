var User = require('../models/User');
var Task = require('../models/Task');

module.exports = {

  user: {
    _id: '57dbf32979de682530f8d629',
    email: 'test@test.com',
    username: 'test',
    password: 'test'
  },

  userWithoutEmail: {
    _id: '57dbf32979de682530f8d629',
    username: 'test',
    password: 'test'
  },

  userWithoutUsername: {
    _id: '57dbf32979de682530f8d629',
    email: 'test@test.com',
    password: 'test'
  },

  userWithoutPassword: {
    _id: '57dbf32979de682530f8d629',
    email: 'test@test.com',
    username: 'test'
  },

  user2: {
    _id: '57dbecbe5554f1102de3b621',
    email: 'test2@test.com',
    username: 'test2',
    password: 'test2'
  },

  userFacebook: {
    _id: '57dbf32979de682530f8d629',
    email: 'test@test.com',
    username: 'test',
    password: 'test',
    facebook: {
      profileId: '10153288209681518'
    }
  },

  userTwitter: {
    _id: '57dbf32979de682530f8d629',
    email: 'test@test.com',
    username: 'test',
    password: 'test',
    twitter: {
      profileId: '140793487'
    }
  },

  task1: {
    _id: '5630f8a4455b683d22f3a084',
    manager: '57dbf32979de682530f8d629', 
    label: 'task1'
  },

  task2: {
    _id: '55113bc6d1909c8f13531ea5',
    manager: '57dbf32979de682530f8d629', 
    label: 'task2'
  },

  saveWellFormedUser: function(callback) {
    var user = new User(this.user);
    user.save(function(err, user) {
      callback(err, user);
    });
  },

  saveWellFormedUserWithTask: function(callback) {
    var task1 = this.task1;
    this.saveWellFormedUser(function(err, user) {
      var task = new Task(task1);
      task.save(function(err, task) {
        callback(err, user, task);
      });
    });
  }
};