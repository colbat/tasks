var mockgoose = require('mockgoose');
var mongoose = require('mongoose');
var tasks = require('../../controllers/tasks');
var users = require('../../controllers/users');
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

describe('Tasks Controller', function() {

  describe('Save', function() {

    it('should save a task in the database', function(done) {
      var mockTask = {label: 'mocktask'};
      tasks.saveTask(mockTask, function(err, task) {
        should.not.exist(err);
        task.label.should.be.equal('mocktask');
        done();
      });
    });

    it('should err when saving a task with missing label', function(done) {
      tasks.saveTask({}, function(err, task) {
        should.exist(err);
        should.not.exist(task);
        done();
      });
    });
  });


  describe('Get', function() {

    it('should retrieve all the tasks for all the users', function(done) {
      var mockTask1 = {label: 'mocktask1'};
      var mockTask2 = {label: 'mocktask2'};
      tasks.saveTask(mockTask1, function(err, task) {
        tasks.saveTask(mockTask2, function(err, task) {
          tasks.getTasks(function(err, tasks) {
            tasks.length.should.be.equal(2);
            done();
          });
        });
      });
    });

    it('should retrieve all the tasks for a user', function(done) {
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

            tasks.getTasksForUser('57dbf32979de682530f8d629', function(err, tasks) {
              tasks.length.should.be.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  
  describe('Update', function() {

    it('should update a task status to "done" for a user', function(done) {
      var mockUser = {
        _id: '57dbf32979de682530f8d629',
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      var task1 = {
        _id: '5630f8a4455b683d22f3a084',
        manager: '57dbf32979de682530f8d629', 
        label: 'task1'
      };

      users.saveUser(mockUser, function(err, user) {

        tasks.saveTask(task1, function(err, task) {

          tasks.updateTask('5630f8a4455b683d22f3a084',
            '57dbf32979de682530f8d629',
            true,
            function(err, nbUpdated) {
              tasks.getTasksForUser('57dbf32979de682530f8d629', function(err, tasks) {
                tasks[0].isDone.should.be.equal(true);
                done();
              });
            });
        });
      });
    });
  });


  describe('Delete', function() {

    it('should delete a task for a user', function(done) {
      var mockUser = {
        _id: '57dbf32979de682530f8d629',
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      var task1 = {
        _id: '5630f8a4455b683d22f3a084',
        manager: '57dbf32979de682530f8d629', 
        label: 'task1'
      };

      users.saveUser(mockUser, function(err, user) {

        tasks.saveTask(task1, function(err, task) {

          tasks.deleteTask('5630f8a4455b683d22f3a084',
            '57dbf32979de682530f8d629',
            function(err, task) {
            tasks.getTasks(function(err, tasks) {
              tasks.length.should.be.equal(0);
              done();
            });
          });
        });
      });
    });

    it('should delete all the completed tasks for a user', function(done) {
      var mockUser = {
        _id: '57dbf32979de682530f8d629',
        email: 'test@test.com',
        username: 'test',
        password: 'test'
      };

      var task1 = {
        _id: '5630f8a4455b683d22f3a084',
        manager: '57dbf32979de682530f8d629', 
        label: 'task1',
        isDone: true
      };

      users.saveUser(mockUser, function(err, user) {

        tasks.saveTask(task1, function(err, task) {

          tasks.deleteCompletedTasks('57dbf32979de682530f8d629', function(err) {

            tasks.getTasksForUser('57dbf32979de682530f8d629', function(err, tasks) {
              tasks.length.should.be.equal(0);
              done();
            })
          });
        });
      });
    });

    it('should delete all the tasks for all the users', function(done) {
      var task1 = {label: 'task1'};
      var task2 = {label: 'task2'};

      tasks.saveTask(task1, function(err, task) {
        tasks.saveTask(task1, function(err, task) {
          tasks.deleteTasks(function(err, nbRemoved) {
            nbRemoved.should.be.equal(2);
            done();
          });
        });
      });
    });
  });
});