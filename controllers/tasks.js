var Task = require('../models/Task');

module.exports = {

  saveTask: function(task, callback) {
    var task = new Task(task);
    task.save(function(err, task) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, task);
    });
  },

  getTasks: function(callback) {
    Task.find(null, function(err, tasks) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, tasks);
    });
  },

  getTasksForUser: function(userId, callback) {
    Task.find({manager: userId}, function(err, tasks) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, tasks);
    });
  },

  updateTask: function(id, userId, isDone, callback) {
    Task.update({_id: id, manager: userId}, {isDone: isDone}, function(err, nbUpdated) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, nbUpdated);
    });
  },

  deleteTask: function(id, userId, callback) {
    Task.findOneAndRemove({_id: id, manager: userId}, function(err, task) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, task);
    });
  },

  deleteCompletedTasks: function(userId, callback) {
    Task.remove({manager: userId, isDone: true}, function(err) {
      if(err) console.log('mongodb error: ' + err);
      callback(err);
    });
  },

  deleteTasks: function(callback) {
    Task.remove(function(err, nbRemoved) {
      if(err) console.log('mongodb error: ' + err);
      callback(err, nbRemoved);
    });
  }

};