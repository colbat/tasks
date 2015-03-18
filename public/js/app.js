var app = angular.module('tasks', []);

app.controller('TaskController', function() {
	this.tasks = tasks;

	this.addTask = function(taskToAdd) {
		var task = {
			label: taskToAdd.label,
			done: false,
			archived: false
		}

		this.tasks.push(task);
		taskToAdd.label = '';
	};

	this.updateDone = function(task) {
		task.done ? task.done = false : task.done = true;
	};
});

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
	