var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var validator = require('../validator');
var config = require('../config');

var csrfProtection = csrf();

// db Model
var User = require('../models/user');

/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {
  res.render('index', {csrfToken: req.csrfToken()});
});

router.post('/login', csrfProtection, checkNotLogin);
router.post('/login', csrfProtection, function(req, res, next) {
  var status = {success: false,
                data: {username: req.body.username,
                       err: null,
                      }
               };

  if (!validator.checkUsername(req.body.username)) {
    status.data.err = 'Invalid username';
    return res.send(status);
  }

  User.findOne({username: req.body.username}, function(err, user) {
    if (err) {
      status.data.err = 'Datebase error';
    } else if (user) {
      if (user.comparePassword(req.body.password)) {
        if (req.body.remember_me === 'true')
          res.cookie('rememberMe', {uid: user._id, token: user.getUsernameToken(), keep_login: true}, config.cookie);
        req.session.user = user;
        status.success = true;
      } else {
        status.data.err = 'Password wrong';
      }
    } else {
      status.data.err = 'User does not exist';
    }
    res.send(status);
  });
});

router.post('/regist', csrfProtection, checkNotLogin);
router.post('/regist', csrfProtection, function(req, res, next) {
  var status = {success: false,
                data: {username: req.body.username,
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

  User.findOne({username: req.body.username}, function(err, userByName) {
    if (err) {
      status.data.err = 'Database error';
      return res.send(status);
    } else if (userByName) {
      status.data.err = 'Username already exists';
      return res.send(status);
    }

    User.findOne({email: req.body.email}, function(err, userByEmail) {
      if (err) {
        status.data.err = 'Database error';
      } else if (userByEmail) {
        status.data.err = 'Email already exists';
      } else {
        status.success = true;
        var user = new User(userInfo);
        req.session.user = user;
        user.save();
        user.sendConfirmMail(req.headers.host, '/confirm/check/', user.username);
      }
      res.send(status);
    });
  });
});

router.get('/logout', checkHasLogin);
router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.clearCookie('rememberMe');
  res.redirect(req.headers.referer);
});

// check if login
function checkHasLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}

module.exports = router;
