var express = require('express');
var router = express.Router();

/* Angular routes partials */

router.get('/home', function(req, res, next) {
  res.render('partials/home');
});

router.get('/sign_in', function(req, res, next) {
  res.render('partials/sign-in');
});

router.get('/sign_up', function(req, res, next) {
  res.render('partials/sign-up');
});

module.exports = router;