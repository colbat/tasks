var mockgoose = require('mockgoose');
var tasks = require('../../controllers/tasks');
var users = require('../../controllers/users');
var chai = require('chai');
var should = chai.should();
var connectDB = require('../utils').connectDB;
var disconnectDB = require('../utils').disconnectDB;
var helper = require('../helper');

describe('Tasks Controller', function() {

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
      var mockUser = helper.user;
      var task1 = helper.task1;
      var task2 = helper.task2;
      
      users.saveUser(mockUser, function(err, user) {
        tasks.saveTask(task1, function(err, task) {
          tasks.saveTask(task2, function(err, task) {
            tasks.getTasksForUser(mockUser._id, function(err, tasks) {
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
      var mockUser = helper.user
      var task1 = helper.task1

      users.saveUser(mockUser, function(err, user) {
        tasks.saveTask(task1, function(err, task) {
          tasks.updateTask(task1._id, mockUser._id, true,
            function(err, nbUpdated) {
              tasks.getTasksForUser(mockUser._id, function(err, tasks) {
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
      var mockUser = helper.user;
      var task1 = helper.task1;

      users.saveUser(mockUser, function(err, user) {
        tasks.saveTask(task1, function(err, task) {
          tasks.deleteTask(task1._id, mockUser._id, function(err, task) {
            tasks.getTasks(function(err, tasks) {
              tasks.length.should.be.equal(0);
              done();
            });
          });
        });
      });
    });

    it('should delete all the completed tasks for a user', function(done) {
      var mockUser = helper.user;
      var task1 = helper.task1;
      task1.isDone = true;

      users.saveUser(mockUser, function(err, user) {
        tasks.saveTask(task1, function(err, task) {
          tasks.deleteCompletedTasks(mockUser._id, function(err) {
            tasks.getTasksForUser(mockUser._id, function(err, tasks) {
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