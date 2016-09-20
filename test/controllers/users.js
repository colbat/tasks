var mockgoose = require('mockgoose');
var users =require('../../controllers/users');
var tasks = require('../../controllers/tasks');
var chai = require('chai');
var should = chai.should();
var connectDB = require('../utils').connectDB;
var disconnectDB = require('../utils').disconnectDB;
var helper = require('../helper');

describe('Users Controller', function() {

  before(function(done) {
    connectDB(function(err) {
      done(err);
    });
  });

  after(function() {
    disconnectDB();
  });

  afterEach(function(done) {
    mockgoose.reset();
    done();
  });

  describe('Save', function() {

    it('should save the user in the database', function(done) {
      var mockUser = helper.user;
      users.saveUser(mockUser, function(err, user) {
        should.not.exist(err);
        user.email.should.be.equal(mockUser.email);
        user.username.should.be.equal(mockUser.username);
        done();
      });
    });

    it('should err when saving local user with missing email', function(done) {
      var mockUser = helper.userWithoutEmail;
      users.saveUser(mockUser, function(err, user) {
        should.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should err when saving local user with missing username', function(done) {
      var mockUser = helper.userWithoutUsername;
      users.saveUser(mockUser, function(err, user) {
        should.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should err when saving local user with missing password', function(done) {
      var mockUser = helper.userWithoutPassword;
      users.saveUser(mockUser, function(err, user) {
        should.exist(err);
        should.not.exist(user);
        done();
      });
    });
  });


  describe('Get', function() {

    it('should retrieve all the users', function(done) {  
      var mockUser1 = helper.user;
      var mockUser2 = helper.user2;
      users.saveUser(mockUser1, function(err, user) {
        users.saveUser(mockUser2, function(err, user) {
          users.getUsers(function(err, users) {
            users.should.have.length(2);
            done();
          });
        });
      });
    });

    it('should retrieve a user by id', function(done) {
      var mockUser = helper.user;
      users.saveUser(mockUser, function(err, user) {
        users.getUser(mockUser._id, function(err, user) {
          should.exist(user);
          user._id.toString().should.be.equal(mockUser._id);
          done();
        });
      });
    });

    it('should retrieve a user by email', function(done) {
      var mockUser = helper.user;
      users.saveUser(mockUser, function(err, user) {
        users.getUserByEmail(mockUser.email, function(err, user) {
          should.exist(user);
          user.email.should.be.equal(mockUser.email);
          done();
        });
      });
    });

    it('should retrieve a user by facebook profile id', function(done) {
      var mockUser = helper.userFacebook;
      users.saveUser(mockUser, function(err, user) {
        users.getUserByFacebookProfileId(mockUser.facebook.profileId, function(err, user) {
          should.exist(user);
          user.facebook.profileId.should.be.equal(mockUser.facebook.profileId);
          done();
        });
      });
    });

    it('should retrieve a user by twitter profile id', function(done) {
      var mockUser = helper.userTwitter;
      users.saveUser(mockUser, function(err, user) {
        users.getUserByTwitterProfileId(mockUser.twitter.profileId, function(err, user) {
          should.exist(user);
          user.twitter.profileId.should.be.equal(mockUser.twitter.profileId);
          done();
        });
      });
    });
  });


  describe('Delete', function() {

    it('should delete a user', function(done) {
      var mockUser = helper.user;
      users.saveUser(mockUser, function(err, user) {
        users.deleteUser(mockUser._id, function(err, user) {
          user._id.toString().should.be.equal(mockUser._id);
          users.getUsers(function(err, users) {
            users.should.have.length(0);
            done();
          });
        });
      });
    });

    it('should delete all the tasks of the user when this user is deleted', function(done) {
      var mockUser = helper.user;
      var task1 = helper.task1;
      var task2 = helper.task2;

      users.saveUser(mockUser, function(err, user) {
        tasks.saveTask(task1, function(err, task) {
          tasks.saveTask(task2, function(err, task) {
            users.deleteUser(mockUser._id, function(err, user) {
              tasks.getTasks(function(err, allTasks) {
                allTasks.should.have.length(0);
                done();
              });
            });
          });
        });
      });
    });

  });

});