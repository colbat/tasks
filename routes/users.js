var qs = require('querystring');
var request = require('request');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var createToken = require('../auth').createToken;
var config = require('../config');

router.get('/', function(req, res, next) {
  User.find(null, '+password', function(err, users) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when retrieving the users.');
    }
    
    res.setHeader('cache-control', 'no-cache');
    res.json(users);
  });
});

router.delete('/:id', function(req, res, next) {
  var key = req.body.superUserKey;
  User.findOneAndRemove({_id: req.params.id}, function(err, user) {
    if(err || key !== config.SUPER_USER_API_KEY) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when removing the user.');
    }

    // Fires the remove hook
    user.remove();
    
    res.send('User successfully deleted: ' + user._id);
  });
});

router.post('/signup', function(req, res, next) {
  var reqEmail = req.body.email.toLowerCase();
  User.findOne({email: reqEmail}, function(err, existingUser) {
    if(existingUser) {
      return res.status(401).send({message: 'Email is already taken'});
    }

    if(!req.body.password) {
      return res.status(401).send({message: 'Password is required'});
    }

    if(!req.body.password) {
      return res.status(401).send({message: 'Email is required'});
    }

    var user = new User(req.body);
    
    user.save(function(err, user) {
      if(err) {
        console.log('mongodb error: ' + err);
        return res.send('An error occured when signing up an user.');
      }

      var token = createToken(user);

      res.send({
        message: 'User successfully signed up.',
        token: token,
        user: user
      });
    });
  });
});

router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, '+password', function(err, user) {
    if(err) {
      console.log('mongodb error: ' + err);
      return res.send('An error occured when retrieving the user.');
    }

    if(!user) {
      return res.status(401).send({message: 'Wrong email and/or password'});
    }

    user.comparePassword(req.body.password, function(err, isMatch) {
      if(!isMatch) {
        return res.status(401).send({message: 'Wrong email and/or password'});
      }

      user = user.toObject();
      delete user.password;

      var token = createToken(user);
      res.send({
        message: 'Password does match. Signing in...',
        token: token,
        user: user
      });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
router.post('/auth/facebook', function(req, res, next) {
  var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.3/me';

  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({url: accessTokenUrl, qs: params, json: true}, function(err, response, accessToken) {
    if(response.statusCode !== 200) {
      return res.status(500).send({message: accessToken.error.message});
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({url: graphApiUrl, qs: accessToken, json: true}, function(err, response, profile) {
      if(response.statusCode !== 200) {
        return res.status(500).send({message: profile.error.message});
      }

      // Step 2a. Link user accounts.
      if(req.headers.authorization) {
        User.findOne({'facebook.profileId': profile.id}, function(err, existingUser) {
          if(existingUser) {
            return res.status(409).send({message: 'There is already a Facebook account that belongs to you'});
          }

          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.tokenSecret);

          User.findById(payload.sub, '+password', function(err, user) {
            if(!user) {
              return res.status(400).send({message: 'User not found'});
            }

            user.email = profile.email;
            user.facebook.profileId = profile.id;
            user.facebook.accessToken = accessToken.access_token;
            
            //user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
            //user.displayName = user.displayName || profile.name;

            user.save(function() {
              var token = createToken(user);
              return res.send({
                token: token,
                user: user
              });
            });
          });
        });
      } else {
        // Step 2b. Create a new user account or return an existing one.
        User.findOne({'facebook.profileId': profile.id}, function(err, existingUser) {
          if(existingUser) {
            var token = createToken(existingUser);
            return res.send({
              token: token,
              user: existingUser
            });
          }

          var user = new User();
          user.email = profile.email;
          user.facebook.profileId = profile.id;
          user.facebook.accessToken = accessToken.access_token;
          //user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          //user.displayName = profile.name;

          user.save(function(err, user) {
            if(err) {
              console.log('mongodb error: ' + err);
              return res.send('An error occured when signing up an user.');
            }

            var token = createToken(user);
            res.send({
              token: token,
              user: user
            });
          });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Twitter
 |--------------------------------------------------------------------------
 */
router.get('/auth/twitter', function(req, res) {
  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var authenticateUrl = 'https://api.twitter.com/oauth/authenticate';

  if(!req.query.oauth_token || !req.query.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      callback: config.TWITTER_CALLBACK
    };

    // Step 1. Obtain request token for the authorization popup.
    request.post({url: requestTokenUrl, oauth: requestTokenOauth}, function(err, response, body) {
      var oauthToken = qs.parse(body);
      var params = qs.stringify({oauth_token: oauthToken.oauth_token});

      // Step 2. Redirect to the authorization screen.
      res.redirect(authenticateUrl + '?' + params);
    });
  } else {
    var accessTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      token: req.query.oauth_token,
      verifier: req.query.oauth_verifier
    };

    // Step 3. Exchange oauth token and oauth verifier for access token.
    request.post({url: accessTokenUrl, oauth: accessTokenOauth}, function(err, response, profile) {
      profile = qs.parse(profile);

      // Step 4a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({'twitter.profileId': profile.user_id}, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
          }

          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);

          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }

            user.twitter.profileId = profile.user_id;
            user.username = user.username || profile.screen_name;

            user.save(function() {
              var token = createToken(user);
              return res.send({
                token: token,
                user: user
              });
            });
          });
        });
      } else {
        // Step 4b. Create a new user account or return an existing one.
        User.findOne({'twitter.profileId': profile.user_id }, function(err, existingUser) {
          if (existingUser) {
            var token = createToken(existingUser);
            return res.send({
              token: token,
              user: existingUser
            });
          }

          var user = new User();
          user.twitter.profileId = profile.user_id;
          user.username = profile.screen_name;

          user.save(function(err, user) {
            if(err) {
              console.log('mongodb error: ' + err);
              return res.send('An error occured when signing up an user.');
            }

            var token = createToken(user);
            res.send({
              token: token,
              user: user
            });
          });
        });
      }
    });
  }
});

module.exports = router;