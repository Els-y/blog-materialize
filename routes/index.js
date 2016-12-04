var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var validator = require('../modules/validator');
var config = require('../modules/config');
var Promise = require('bluebird');
var userPromise = require('../modules/promise/userPromise');
var authority = require('../modules/authority');

var csrfProtection = csrf();

// db Model
var User = require('../models/user');

/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {
  res.render('index', {csrfToken: req.csrfToken()});
});

router.post('/login', authority.checkNotLogin);
router.post('/login', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    data: {
      username: req.body.username,
      ifconfirmed: true,
      role: 0,
      err: null,
    }
   };

  if (!validator.checkUsername(req.body.username)) {
    status.data.err = 'Invalid username';
    return res.send(status);
  }

  userPromise.findUserByNamePromise(req.body.username).then(function(user) {
    if (user.comparePassword(req.body.password)) {
      if (req.body.remember_me === 'true')
        res.cookie('rememberMe', {uid: user._id, token: user.getUsernameToken(), keep_login: true}, config.cookie);
      req.session.user = user;
      status.success = true;
      status.data.role = user.role;
      if (!user.confirmed) status.data.ifconfirmed = false;
    } else {
      status.data.err = 'Password wrong';
    }
  }).catch(function(reason) {
    status.data.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

router.post('/regist', authority.checkNotLogin);
router.post('/regist', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    data: {
      username: req.body.username,
      err: null,
    }
  };

  var userInfo = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    avatar: '/images/avatar/default01.jpg',
    registDate: Date(),
    confirmDate: Date(),
    confirmed: false,
    role: 0,
    encrypt: false
  };

  if (!validator.checkUsername(req.body.username)) {
    status.data.err = 'Invalid username';
    return res.send(status);
  } else if (!validator.checkPassword(req.body.password) || !validator.checkPassword(req.body.confirm)) {
    status.data.err = 'Invalid password';
    return res.send(status);
  } else if (!validator.checkSame(req.body.password, req.body.confirm)) {
    status.data.err = 'Passwords are not consistent';
    return res.send(status);
  }

  userPromise.findUserNotExistByNameAndEmail(req.body.username, req.body.email).then(function() {
    var user = new User(userInfo);
    status.success = true;
    req.session.user = user;
    user.save();
    user.sendRegistConfirmMail(req.headers.host);
  }).catch(function(reason) {
    status.data.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

router.get('/logout', authority.checkHasLogin);
router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.clearCookie('rememberMe');
  res.redirect(req.headers.referer);
});

module.exports = router;
