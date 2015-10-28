var User = require('./models/User');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('./config');

exports.createToken = function(user) {
  var payLoad = {
    exp: moment().add('14', 'days').unix(),
    iat: moment().unix(),
    sub: user._id
  }

  return jwt.encode(payLoad, config.tokenSecret);
}

exports.isAuthenticated = function(req, res, next) {
  if(!(req.headers && req.headers.authorization)) {
    return res.status(400).send({message: 'You did not provide a JSON Web Token in the Authorization header.'});
  }

  var header = req.headers.authorization.split(' ');
  var token = header[1];
  var payload = jwt.decode(token, config.tokenSecret);
  var now = moment().unix();

  if(now > payload.exp) {
    return res.status(400).send({message: 'Token has expired.'});
  }

  User.findById(payload.sub, function(err, user) {
    if(!user) {
      return res.status(400).send({message: 'User does not longer exist.'})
    }

    req.user = user;
    next();
  });
}