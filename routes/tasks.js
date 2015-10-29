/* Tasks API */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Task = require('../models/Task');
var isAuthenticated = require('../auth').isAuthenticated;
var config = require('../config');

router.get('/', isAuthenticated, function(req, res, next) {
  Task.find({manager: req.user._id}, function(err, tasks) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when retrieving the tasks.');
    }

    console.log('User asking: ' + req.user._id);
    
    res.setHeader('cache-control', 'no-cache');
    res.send(tasks);
  });
});

router.post('/all', function(req, res, next) {
  var key = req.body.superUserKey;
  Task.find(null, function(err, tasks) {
    if(err || key !== config.SUPER_USER_API_KEY) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when retrieving all the tasks.');
    }

    res.setHeader('cache-control', 'no-cache');
    res.json(tasks);
  });
});

router.post('/add', isAuthenticated, function(req, res, next) {
  if(!req.body.label) {
    return res.status(401).send({message: 'Please name your task.'});
  }

  var task = new Task({
    manager: req.user._id,
    label: req.body.label
  });

  task.save(function(err, task) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when adding a task.');
    }

    res.send('Task successfully added: ' + task.label);
  });
});

router.get('/add', isAuthenticated, function(req, res, next) {
  var task = new Task({label: 'I need to do that'});
  task.save(function(err, task) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when adding a task.');
    }

    res.send('Task successfully added: ' + task.label);
  });
});

router.put('/:id', isAuthenticated, function(req, res, next) {
  Task.update({_id: req.params.id}, {isDone: req.body.isDone}, 
    function(err, updated) {
      if(err) {
        console.log('mongodb error: ' + err);
        return res.send('An error occured while updating the task.');
      }

      res.send(updated + ' task successfully updated.');
    });
});

router.delete('/completed', isAuthenticated, function(req, res, next) {
  Task.remove({isDone: true}, function(err, tasks) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when deleting a task.');
    }

    res.send('Task successfully deleted: ' + tasks.label);
  });
});

router.delete('/:id', isAuthenticated, function(req, res) {
  Task.findOneAndRemove({_id: req.params.id}, function(err, tasks) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when deleting a task.');
    }

    res.send('Task successfully deleted: ' + tasks.label);
  });
});

router.delete('/', function(req, res, next) {
  var key = req.body.superUserKey;
  Task.remove(function(err, nbRemoved) {
    if(err || key !== config.SUPER_USER_API_KEY) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured.');
    }

    res.send('All the tasks were successfully deleted.');
  });
});

module.exports = router;