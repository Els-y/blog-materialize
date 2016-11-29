var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var csrf = require('csurf');
var csrfProtection = csrf();

var validator = require('../validator');
var User = require('../models/user');

// forgot password
router.post('/', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    data: {
      username: req.body.username,
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
      status.success = true;
      req.session.token = crypto.randomBytes(8).toString('hex');
      res.cookie('forgotPassword', {uid: user._id, token: user.getUsernameToken(req.session.token)}, {maxAge: 1000 * 60 * 5});

      User.sendForgotConfirmMail(user.email, req.headers.host, req.session.token);
    } else {
      status.data.err = 'Username or email wrong';
    }
    res.send(status);
  });
});

router.get('/check/:confirmUrl', csrfProtection, function(req, res, next) {
  if (!User.checkIfForgotConfirmUrl(req.params.confirmUrl, req.session.token))
    return res.render('forgot/invalid',  {csrfToken: req.csrfToken()});

  if (req.cookies.forgotPassword) {
    var forgot = req.cookies.forgotPassword;
    User.findById(forgot.uid, function(err, user) {
      if (user && user.compareUsernameToken(forgot.token)) {
        req.session.forgot_username = user.username;
        res.clearCookie('forgotPassword');
        res.render('forgot/reset', {csrfToken: req.csrfToken()});
      } else {
        res.render('forgot/invalid', {csrfToken: req.csrfToken()});
      }
    });
  } else {
    res.redirect('/');
  }
});


module.exports = router;
