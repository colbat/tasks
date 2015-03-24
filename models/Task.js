var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
  label: {type: String, required: true},
  isDone: {type: Boolean, default: false},
  isArchived: {type: Boolean, default: false}
});

module.exports = mongoose.model('Task', taskSchema);