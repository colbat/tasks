var express = require('express');
var router = express.Router();
var isAuthenticated = require('../auth').isAuthenticated;
var isSuperUser = require('../auth').isSuperUser;
var tasks = require('../controllers/tasks');


/*
 * GET /tasks - Retrieves all the tasks for the signed in user
 */
router.get('/', isAuthenticated, function(req, res, next) {
  tasks.getTasksForUser(req.user._id, function(err, tasks) {
    if(err) return res.send('An error occured when retrieving the tasks.');
    res.setHeader('cache-control', 'no-cache');
    res.send(tasks);
  });
});


/*
 * POST /tasks/all - Retrieves all the tasks of all the users
 */
router.post('/all', isSuperUser, function(req, res, next) {
  tasks.getTasks(function(err, tasks) {
    if(err) return res.send('An error occured when retrieving the tasks.');
    res.setHeader('cache-control', 'no-cache');
    res.json(tasks);
  });
});


/*
 * POST /tasks/add - Saves the tasks for the user
 */
router.post('/add', isAuthenticated, function(req, res, next) {
  if(!req.body.label) {
    return res.status(401).send({message: 'Please name your task.'});
  }

  var task = {
    manager: req.user._id,
    label: req.body.label
  };

  tasks.saveTask(task, function(err, task) {
    if(err) return res.send('An error occured when adding a task.');
    res.send('Task successfully added: ' + task.label);
  });
});


/*
 * PUT /tasks/:id - Updates the task status for the user
 */
router.put('/:id', isAuthenticated, function(req, res, next) {  
  tasks.updateTask(req.params.id, req.user._id, req.body.isDone, function(err, nbUpdated) {
    if(err) return res.send('An error occured while updating the task.');
    res.send(nbUpdated + ' task updated.');
  });
});


/*
 * DELETE /tasks/completed - Deletes the completed tasks for the user
 */
router.delete('/completed', isAuthenticated, function(req, res, next) {
  tasks.deleteCompletedTasks(req.user._id, function(err) {
    if(err) return res.send('An error occured when deleting the completed tasks.');
    res.send('Completed tasks successfully deleted.');
  });
});


/*
 * DELETE /tasks/:id - Deletes a specific task for the user
 */
router.delete('/:id', isAuthenticated, function(req, res) {
  tasks.deleteTask(req.params.id, req.user._id, function(err, task) {
    if(err) return res.send('An error occured when deleting a task.');
    if(!task) return res.send('Task not found.');
    res.send('Task successfully deleted: ' + tasks.label);
  });
});


/*
 * DELETE /tasks - Deletes all the tasks of all the users
 */
router.delete('/', isSuperUser, function(req, res, next) {
  tasks.deleteTasks(function(err, nbRemoved) {
    if(err) return res.send('An error occured when removing all the tasks.');
    res.send(nbRemoved + ' tasks were deleted.');
  });
});

module.exports = router;