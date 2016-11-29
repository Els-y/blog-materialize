var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var User = require('../models/user');
var csrfProtection = csrf();

router.get('/check/:confirmUrl', checkHasLogin);
router.get('/check/:confirmUrl', function(req, res, next) {
  if (req.session.user.confirmed) {
    res.redirect('/');
  } else {
    User.findOne({username: req.session.user.username}, function(err, user) {
      if (err) {
        console.log(err);
      } else {
        if (!user.confirmAccount(req.params.confirmUrl)) {
          res.redirect('/confirm/invalid');
        } else {
          req.session.user = user;

          // confirm the user's confirmed is true
          if (!req.session.user.confirmed)
            req.session.user.confirmed = true;

          res.redirect('/');
        }
      }
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

  User.findOne({username: req.session.user.username}, function(err, user) {
    if (err) {
      status.data.err = 'Database error';
    } else {
      user.sendRegistConfirmMail(req.headers.host);
      status.success = true;
    }
    res.send(status);
  });
});

function checkHasLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}

module.exports = router;
