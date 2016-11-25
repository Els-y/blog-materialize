var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var csrf = require('csurf');
var csrfProtection = csrf();

var config = require('../config');
var validator = require('../validator');
var User = require('../models/user');

// forgot password
router.post('/', csrfProtection, function(req, res, next) {
  var status = {success: false,
                data: {username: req.body.username,
                       err: null,
                      }
               };

  if (!validator.checkUsername(req.body.username)) {
    status.data.err = 'Invalid username';
    return res.send(status);
  } else if (!validator.checkEmail(req.body.email)) {
    status.data.err = 'Invalid email';
    return res.send(status);
  }

  User.findOne({username: req.body.username}, function(err, user) {
    if (err) {
      status.data.err = 'Datebase error';
    } else if (user && user.email === req.body.email) {
      req.session.token = crypto.randomBytes(8).toString('hex');
      user.sendConfirmMail(req.headers.host, '/forgot/check/', config.secret + 'forgotPassword' + req.session.token);
      status.success = true;
      res.cookie('forgotPassword', {uid: user._id, token: user.getUsernameToken(req.session.token)}, {maxAge: 1000 * 60 * 1});
    } else {
      status.data.err = 'Username or email wrong';
    }
    res.send(status);
  });
});

router.get('/check/:confirmUrl', function(req, res, next) {
  if (!checkIfForgotConfirmUrl(req.params.confirmUrl, req.session.token))
    return res.render('forgot/invalid');

  if (req.cookies.forgotPassword) {
    var forgot = req.cookies.forgotPassword;
    User.findById(forgot.uid, function(err, user) {
      if (user && user.compareUsernameToken(forgot.token)) {
        if (user.confirmOverdue()) return res.render('forgot/invalid');
        req.session.user = user;
        req.session.operation = 'reset-password';
        res.redirect('/forgot/reset');
      } else {
        res.redirect('/invalid');
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/reset', csrfProtection, checkOperationIsResetPassword);
router.get('/reset', csrfProtection, function(req, res, next) {
  res.render('forgot/reset', {csrfToken: req.csrfToken()});
});

function checkIfForgotConfirmUrl(confirmUrl, token) {
  return bcrypt.compareSync(config.secret + 'forgotPassword' + token, confirmUrl);
}

// check operation == reset
function checkOperationIsResetPassword(req, res, next) {
  if (req.session.operation && req.session.operation === 'reset-password') {
    next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;
