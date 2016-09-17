var mockgoose = require('mockgoose');
var mongoose = require('mongoose');
var users =require('../../controllers/users');
var tasks = require('../../controllers/tasks');
var assert = require('assert');
var chai = require('chai');
var should = chai.should();

// Mocks the mongoose connection
before(function(done) {
  if(mongoose.connection.readyState === 0) {
    mockgoose(mongoose).then(function() {
      mongoose.connect('mongodb://localhost/tasks', function(err) {
        done(err);
      });
    });
  } else {
    done();
  }
});

afterEach(function(done) {
  mockgoose.reset();
  done();
});

after(function(done) {
  mongoose.disconnect(done);
});

describe('Users Controller', function() {

  describe('Save', function() {

    it('should save the user in the database', function(done) {
      var mockUser = {
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };
      users.saveUser(mockUser, function(err, user) {
        should.not.exist(err);
        assert.equal(mockUser.email, user.email);
        assert.equal(mockUser.username, user.username);
        done();
      });
    });

    it('should err when saving local user with missing email', function(done) {
      var mockUser = {
        username: 'test',
        password: 'test'
      };
      users.saveUser(mockUser, function(err, user) {
        should.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should err when saving local user with missing username', function(done) {
      var mockUser = {
        email: 'test@test.com',
        password: 'test'
      };
      users.saveUser(mockUser, function(err, user) {
        should.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should err when saving local user with missing password', function(done) {
      var mockUser = {
        email: 'test@test.com',
        username: 'test'
      };
      users.saveUser(mockUser, function(err, user) {
        should.exist(err);
        should.not.exist(user);
        done();
      });
    });
  });


  describe('Get', function() {

    it('should retrieve all the users', function(done) {   
      var mockUser1 = {
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      var mockUser2 = {
        email: 'test2@test.com',
        username: 'test2',
        password: 'test2'
      };

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
      var mockUser = {
        _id: '57dbf32979de682530f8d629',
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      users.saveUser(mockUser, function(err, user) {
        users.getUser('57dbf32979de682530f8d629', function(err, user) {
          should.exist(user);
          user._id.toString().should.be.equal('57dbf32979de682530f8d629');
          done();
        });
      });
    });

    it('should retrieve a user by email', function(done) {
      var mockUser = {
        email: 'testbyemail@test.com',
        username: 'test',
        password: 'test'
      };

      users.saveUser(mockUser, function(err, user) {
        users.getUserByEmail('testbyemail@test.com', function(err, user) {
          should.exist(user);
          user.email.should.be.equal('testbyemail@test.com');
          done();
        });
      });
    });

    it('should retrieve a user by facebook profile id', function(done) {
      var mockUser = {
        email: 'test@test.com',
        username: 'test',
        password: 'test',
        facebook: {
          profileId: '10153288209681518'
        }
      };

      users.saveUser(mockUser, function(err, user) {
        users.getUserByFacebookProfileId('10153288209681518', function(err, user) {
          should.exist(user);
          user.facebook.profileId.should.be.equal('10153288209681518');
          done();
        });
      });
    });

    it('should retrieve a user by twitter profile id', function(done) {
      var mockUser = {
        email: 'test@test.com',
        username: 'test',
        password: 'test',
        twitter: {
          profileId: '140793487'
        }
      };

      users.saveUser(mockUser, function(err, user) {
        users.getUserByTwitterProfileId('140793487', function(err, user) {
          should.exist(user);
          user.twitter.profileId.should.be.equal('140793487');
          done();
        });
      });
    });
  });


  describe('Delete', function() {

    it('should delete a user', function(done) {
      var mockUser = {
        _id: '57dbf32979de682530f8d629',
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      users.saveUser(mockUser, function(err, user) {
        users.deleteUser('57dbf32979de682530f8d629', function(err, user) {
          user._id.toString().should.be.equal('57dbf32979de682530f8d629');
          users.getUsers(function(err, users) {
            users.should.have.length(0);
            done();
          });
        });
      });
    });

    it('should delete all the tasks of the user when this user is deleted', function(done) {
      var mockUser = {
        _id: '57dbf32979de682530f8d629',
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      var task1 = {manager: '57dbf32979de682530f8d629', label: 'task1'};
      var task2 = {manager: '57dbf32979de682530f8d629', label: 'task2'};

      users.saveUser(mockUser, function(err, user) {

        tasks.saveTask(task1, function(err, task) {

          tasks.saveTask(task2, function(err, task) {

            users.deleteUser('57dbf32979de682530f8d629', function(err, user) {

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