var mockgoose = require('mockgoose');
var mongoose = require('mongoose');

exports.connectDB = function(cb) {
  mockgoose(mongoose).then(function() {
    mongoose.connect('mongodb://localhost/tasks', cb);
  });
};

exports.disconnectDB = function() {
  mongoose.disconnect();
};