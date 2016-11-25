var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();

var validator = require('../validator');
var User = require('../models/user');

/* GET users listing. */
router.get('/settings', csrfProtection, checkHasLogin);
router.get('/settings', csrfProtection, function(req, res, next) {
  res.render('users/settings', {csrfToken: req.csrfToken()});
});

router.post('/resetpassword', csrfProtection, checkOperationIsResetPassword);
router.post('/resetpassword', csrfProtection, function(req, res, next) {
  var status = {success: false,
                err: null
               };

  if (!validator.checkPassword(req.body.password) || !validator.checkPassword(req.body.confirm)) {
    status.err = 'Invalid password';
    res.send(status);
  } else if (!validator.checkSame(req.body.password, req.body.confirm)) {
    status.err = 'Passwords are not consistent';
    res.send(status);
  } else {
    status.success = true;
    req.session.operation = null;
    // req.session.user = null;
    User.findOne({username: req.session.user.username}, function(err, user) {
      user.encrypt = false;
      user.password = req.body.password;

      user.save(function() {
        req.session.user = null;
        res.send(status);
      });
    });
  }
});

router.post('/changepassword', csrfProtection, checkHasLogin);
router.post('/changepassword', csrfProtection, function(req, res, next) {
  var status = {success: false,
                err: null
               };

  if (!validator.checkPassword(req.body.oldpassword) || !validator.checkPassword(req.body.newpassword) ||
!validator.checkPassword(req.body.confirmnew)) {
    status.err = 'Invalid password';
    res.send(status);
  } else if (!validator.checkSame(req.body.newpassword, req.body.confirmnew)) {
    status.err = 'Passwords are not consistent';
    res.send(status);
  } else {
    User.findOne({username: req.session.user.username}, function(err, user) {
      if (user.comparePassword(req.body.oldpassword)) {
        status.success = true;
        user.encrypt = false;
        user.password = req.body.newpassword;

        user.save(function() {
          req.session.user = user;
          res.send(status);
        });
      } else {
        status.err = 'Password error';
        res.send(status);
      }
    });
  }
});

// check operation == reset
function checkOperationIsResetPassword(req, res, next) {
  if (req.session.operation && req.session.operation === 'reset-password') {
    next();
  } else {
    res.redirect('/');
  }
}

// check if login
function checkHasLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}
module.exports = router;
