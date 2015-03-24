(function() {
  var app = angular.module('tasks', []);

  app.controller('TaskController', ['$http', function($http) {
    var self = this;
    this.tasks = [];

    // Fills the tasks array
    getTasks();
    
    this.addTask = function(taskToAdd) {
      $http.post('tasks/add/', {label: taskToAdd.label}).success(function(data) {
        // Updates the tasks array
        getTasks();
        taskToAdd.label = "";
      });
    };

    this.updateDone = function(task) {
      task.isDone ? task.isDone = false : task.isDone = true;
      $http.put('tasks/' + task._id, {isDone: task.isDone}).success(function(data) {
        //
      });
    };

    this.flushCompletedTasks = function() {
      $http.delete('tasks/completed/').success(function(data) {
        // Updates the tasks array
        getTasks();
      });
    };

    function getTasks() {
      $http.get('tasks/').success(function(data) {
        self.tasks = data;
      });
    }
  }]);

  var tasks = [
    {
      label: 'Doing that',
      done: true,
      archived: false
    },
    {
      label: 'Doing and this..',
      done: false,
      archived: false
    },
    {
      label: 'And after I will do that',
      done: false,
      archived: false
    },
    {
      label: 'And I will go to this',
      done: false,
      archived: false
    },
    {
      label: 'Finally I will finish this one',
      done: false,
      archived: false
    }
  ];
})();
