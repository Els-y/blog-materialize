var express = require('express');
var router = express.Router();
var validator = require('../validator');
var User = require('../models/user');

/* GET users listing. */
router.get('/settings', checkHasLogin);
router.get('/settings', function(req, res, next) {
  res.render('users/settings');
});

router.post('/resetpassword', checkOperationIsResetPassword);
router.post('/resetpassword', function(req, res, next) {
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

router.post('/changepassword', checkHasLogin);
router.post('/changepassword', function(req, res, next) {
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
