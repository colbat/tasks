var qs = require('querystring');
var request = require('request');
var express = require('express');
var router = express.Router();
var createToken = require('../auth').createToken;
var hasTokenExpired = require('../auth').hasTokenExpired;
var isSuperUser = require('../auth').isSuperUser;
var config = require('../config');
var users = require('../controllers/users');


/*
 * POST /users - Retrieves all the users
 */
router.post('/', isSuperUser, function(req, res, next) {
  users.getUsers(function(err, users) {
    if(err) return res.send('An error occured when retrieving the users.');
    res.setHeader('cache-control', 'no-cache');
    res.json(users);
  });
});


/*
 * DELETE /users/:id - Deletes a user
 */
router.delete('/:id', isSuperUser, function(req, res, next) {
  var id = req.params.id;
  users.deleteUser(id, function(err, user) {
    if(err) return res.send('An error occured when removing the user.');
    res.send('User successfully deleted: ' + user._id);
  });
});


/*
 * POST /users/signup - Saves a new user
 */
router.post('/signup', function(req, res, next) {
  users.saveUser(req.body, function(err, user) {
    if(err) return res.send('An error occured when signing up an user.');
    var token = createToken(user);
    res.send({
      message: 'User successfully signed up: ' + user,
      token: token,
      user: user
    });
  });
});


/*
 * POST /users/signin - Login an user
 */
router.post('/signin', function(req, res, next) {
  users.getUserByEmail(req.body.email, function(err, user) {
    if(err) return res.send('An error occured when retrieving the user.');
    if(!user) return res.status(401).send({message: 'Wrong email and/or password'});

    user.comparePassword(req.body.password, function(err, isMatch) {
      if(!isMatch) return res.status(401).send({message: 'Wrong email and/or password'});

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
 * POST /users/check_jwt_expired - Checks if the JW Token is expired
 */
router.post('/check_jwt_expired', function(req, res, next) {
  var expired = hasTokenExpired(req.body.token);
  res.send({hasExpired: expired});
});


/*
 * POST /users/auth/facebook - Login with a Facebook account
 */
router.post('/auth/facebook', function(req, res, next) {
  var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.3/me?fields=id,name,email,picture';

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
        users.getUserByFacebookProfileId(profile.id, function(err, user) {
          if(err) return res.send('An error occured when retrieving the user.');
          if(user) return res.status(409).send({message: 'There is already a Facebook account that belongs to you'});

          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.tokenSecret);

          users.getUser(payload.sub, function(err, user) {
            if(!user) return res.status(400).send({message: 'User not found'});
            user.facebook.profileId = profile.id;
            user.facebook.accessToken = accessToken.access_token;

            users.saveUser(user, function(err, user) {
              if(err) return res.send('An error occured when signing up an user.');
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
        users.getUserByFacebookProfileId(profile.id, function(err, user) {
          if(err) return res.send('An error occured when retrieving the user.');
          // Returns an existing user account
          if(user) {
            // Name is subject to changes. Keeps it updated.
            if(user.displayName !== profile.name) {
              user.displayName = profile.name;
              users.saveUser(user, function(err, user) {
                if(err) return res.send('An error occured when signing up an user.');
              });
            }

            var token = createToken(user);
            return res.send({
              token: token,
              user: user
            });
          }

          // Creates a new user account
          var user = {
            facebook: {
              profileId: profile.id,
              accessToken: accessToken.access_token
            },
            displayName: profile.name
          };

          users.saveUser(user, function(err, user) {
            if(err) return res.send('An error occured when signing up an user.');
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
 * POST /users/auth/twitter - Login with Twitter account
 */
router.get('/auth/twitter', function(req, res) {
  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var authenticateUrl = 'https://api.twitter.com/oauth/authenticate';
  var userInfosUrl = 'https://api.twitter.com/1.1/users/show.json';

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
    request.post({url: accessTokenUrl, oauth: accessTokenOauth}, function(err, response, accessToken) {
      var perm_data = qs.parse(accessToken);
      var oauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: perm_data.oauth_token,
        token_secret: perm_data.oauth_token_secret
      };
      var params = {
        screen_name: perm_data.screen_name,
        user_id: perm_data.user_id
      }

      // Step 4. Retrieve profile information about the current user.
      request.get({url: userInfosUrl, oauth: oauth, qs: params, json: true}, function(err, response, profile) {

        // Step 4a. Link user accounts.
        if (req.headers.authorization) {
          users.getUserByTwitterProfileId(profile.id, function(err, user) {
            if(err) return res.send('An error occured when retrieving the user.');
            if(user) return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
            
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);

            users.getUser(payload.sub, function(user, err) {
              if(!user) return res.status(400).send({ message: 'User not found' });
              user.twitter.profileId = profile.id;
              user.twitter.screenName = profile.screen_name;

              users.saveUser(user, function(err, user) {
                if(err) return res.send('An error occured when signing up an user.');
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
          users.getUserByTwitterProfileId(profile.id, function(err, user) {
            if(err) return res.send('An error occured when retrieving the user.');
            // Returns an existing user account.
            if(user) {
              // Screen name is subject to changes. Keeps it updated.
               if(user.twitter.screenName !== profile.screen_name) {
                user.twitter.screenName = profile.screen_name;
                users.saveUser(user, function(err, user) {
                  if(err) return res.send('An error occured when signing up an user.');
                });
              }

              // Display name is subject to change. Keeps it updated
              if(user.displayName !== profile.name) {
                user.displayName = profile.name;
                users.saveUser(user, function(err, user) {
                  if(err) return res.send('An error occured when signing up an user.');
                });
              }

              var token = createToken(user);
              return res.send({
                token: token,
                user: user
              });
            }

            // Creates a new user account
            var user = {
              twitter: {
                profileId: profile.id,
                screenName: profile.screen_name
              },
              displayName: profile.name
            };

            users.saveUser(user, function(err, user) {
              if(err) return res.send('An error occured when signing up an user.');
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
  }
});

module.exports = router;