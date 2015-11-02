var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var BCRYPT_LOG_ROUNDS = 10;

var userSchema = mongoose.Schema({
  email: {type: String, unique: true, lowercase: true, sparse: true},
  username: {type: String, unique: true, lowercase: true, spare: true},
  displayName: String,
  password: {type: String, select: false},
  createdOn: {type: Date, default: Date.now()},
  modifiedOn: {type: Date, default: Date.now()},
  tasks: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Task'
  }],
  facebook: {
    profileId: String,
    accessToken: String
  },
  twitter: {
    profileId: String,
    screenName: String
  }
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

userSchema.pre('save', function(next) {
  genHash(next, this);
});

userSchema.pre('update', function(next) {
  genHash(next, this);
});

userSchema.pre('remove', function(next) {
  this.model('Task').remove({manager: this._id}, next);
});

function genHash(next, user) {
  if(!user.isModified('password')) return next();

  bcrypt.genSalt(BCRYPT_LOG_ROUNDS, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);

      user.password = hash;
      next();
    });
  });
}

module.exports = mongoose.model('User', userSchema);