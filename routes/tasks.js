/* Tasks API */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Task = require('../models/Task');

var apiKey = '4dmin';

router.get('/', function(request, response) {
  Task.find(function(error, tasks) {
    if(error) {
      console.log('mongodb error: ' + error);
      return response.send('An error occured when retrieving the tasks.');
    }
    
    response.send(tasks);
    response.end();
  });
});

router.post('/add', function(request, response) {
  var task = new Task({label: request.body.label});
  task.save(function(error, task) {
    if(error) {
      console.log('mongodb error: ' + error);
      return response.send('An error occured when adding a task.');
    }

    response.send('Task successfully added: ' + task.label);
    response.end();
  });
});

router.get('/add', function(request, response) {
  var task = new Task({label: 'I need to do that'});
  task.save(function(error, task) {
    if(error) {
      console.log('mongodb error: ' + error);
      return response.send('An error occured when adding a task.');
    }

    response.send('Task successfully added: ' + task.label);
    response.end();
  });
});

router.put('/:id', function(request, response) {
  Task.update({_id: request.params.id}, {isDone: request.body.isDone}, 
    function(error, updated) {
      if(error) {
        console.log('mongodb error: ' + error);
        return response.send('An error occured while updating the task.');
      }

      response.send(updated + ' task successfully updated.');
      response.end();
    });
});

router.delete('/completed', function(request, response) {
  Task.remove({isDone: true}, function(error, tasks) {
    if(error) {
      console.log('mongodb error: ' + error);
      return response.send('An error occured when deleting a task.');
    }

    response.send('Task successfully deleted: ' + tasks.label);
    response.end();
  });
});

router.delete('/:id', function(request, response) {
  Task.findOneAndRemove({_id: request.params.id}, function(error, tasks) {
    if(error) {
      console.log('mongodb error: ' + error);
      return response.send('An error occured when deleting a task.');
    }

    response.send('Task successfully deleted: ' + tasks.label);
    response.end();
  });
});

router.delete('/', function(request, response) {
  var key = request.body.apiKey;
  Task.remove(function(error, nbRemoved) {
    if(error || key !== apiKey) {
      console.log('mongodb error: ' + error);
      return response.send('An error occured.');
    }

    response.send('All the tasks were successfully deleted.');
    response.end();
  });
});

module.exports = router;