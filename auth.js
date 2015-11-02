var User = require('./models/User');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('./config');

var CURRENT_APP_VERSION = 3;

exports.createToken = function(user) {
  var payLoad = {
    exp: moment().add('7', 'days').unix(),
    iat: moment().unix(),
    sub: user._id,
    app_version: CURRENT_APP_VERSION
  }

  return jwt.encode(payLoad, config.tokenSecret);
}

// Initial JWT check before loading the Angular app
exports.hasTokenExpired = function(token) {
  var payload = jwt.decode(token, config.tokenSecret);
  var userId = payload.sub;
  var version = payload.app_version;
  var exp = payload.exp

  // Checks if older than current version
  if(!version || version < CURRENT_APP_VERSION) {
    console.log('Revoking token for user: ' + userId + 
      ' version: ' + version + ' current: ' + CURRENT_APP_VERSION);
    return true;
  }

  // Checks if expired
  var now = moment().unix();
  if(now > exp) {
    return true;
  }

  return false;
}

exports.isAuthenticated = function(req, res, next) {
  if(!(req.headers && req.headers.authorization)) {
    return res.status(400).send({message: 'You did not provide a JSON Web Token in the Authorization header.'});
  }

  var header = req.headers.authorization.split(' ');
  var token = header[1];
  var payload = jwt.decode(token, config.tokenSecret);
  var userId = payload.sub;
  var version = payload.app_version;
  var exp = payload.exp

  // Checks if older than current version
  if(!version || version < CURRENT_APP_VERSION) {
    console.log('Revoking token for user: ' + userId + 
      ' version: ' + version + ' current: ' + CURRENT_APP_VERSION);
    return res.status(400).send({message: 'The session has expired. Please log in again'});
  }

  // Checks if expired
  var now = moment().unix();
  if(now > exp) {
    return res.status(400).send({message: 'Token has expired. Please log in again'});
  }

  // Return the user to whom the token belongs
  User.findById(userId, function(err, user) {
    if(!user) {
      return res.status(400).send({message: 'User does not longer exist.'})
    }
    req.user = user;
    next();
  });
}