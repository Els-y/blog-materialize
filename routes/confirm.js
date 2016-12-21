var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Promise = require('bluebird');
var userPromise = require('../modules/promise/userPromise');
var authority = require('../modules/authority');

var User = require('../models/user');
var csrfProtection = csrf();

router.get('/check/:confirmUrl', authority.checkHasLogin);
router.get('/check/:confirmUrl', function(req, res, next) {
  if (req.session.user.confirmed) {
    res.redirect('/');
  } else {
    userPromise.findUserByNamePromise(req.session.user.username).then(function(user) {
      if (!user.confirmAccount(req.params.confirmUrl)) {
        res.redirect('/confirm/invalid');
      } else {
        req.session.user = user;

        // confirm the user's confirmed is true
        if (!req.session.user.confirmed)
          req.session.user.confirmed = true;

        res.redirect('/');
      }
    }).catch(function(reason) {
      console.log(reason);
      res.redirect('/');
    });
  }
});

router.get('/invalid', csrfProtection, function(req, res, next) {
  res.render('confirm/invalid', {csrfToken: req.csrfToken()});
});

router.get('/resend', function(req, res, next) {
  var status = {
    success: false,
    data: {
      username: req.body.username,
      err: null,
    }
   };

  if (!req.session.user) {
    status.data.err = 'Please login first';
    return res.send(status);
  }

  userPromise.findUserByNamePromise(req.session.user.username).then(function(user) {
    user.sendRegistConfirmMail(req.headers.host);
    status.success = true;
  }).catch(function(reason) {
    status.data.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

module.exports = router;
