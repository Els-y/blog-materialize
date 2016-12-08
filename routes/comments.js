var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var Promise = require('bluebird');

var authority = require('../modules/authority');
var Article = require('../models/article');
var Comment = require('../models/comment');

router.post('/newcomment', csrfProtection, function(req, res, next) {
  var reg_articleId = /passage\/(.+)/;
  var status = {
    success: false,
    err: null
  };

  if (!req.session.user) {
    status.err = 'Please login first';
    return res.send(status);
  } else if (req.body.content.trim() === '') {
    status.err = 'Comment empty';
    return res.send(status);
  }

  if (req.body.reply === 'false') {
    var commentInfo = {
      article: reg_articleId.exec(req.headers.referer)[1],
      author: req.session.user.username,
      avatar: req.session.user.avatar,
      content: req.body.content,
      time: new Date().toISOString(),
      replies: []
    };

    Article.findById({_id: commentInfo.article}).exec().then(function(article) {
      return new Promise(function(resolve, reject) {
        if (article) resolve();
        else reject("Article doesn't exist");
      });
    }).then(function() {
      var comment = new Comment(commentInfo);
      return comment.save();
    }).then(function() {
      status.success = true;
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });
  } else {
    var reply = {
      author: req.session.user.username,
      avatar: req.session.user.avatar,
      content: req.body.content,
      time: new Date().toISOString()
    };

    Comment.findById({_id: req.body.commentId}).exec().then(function(comment) {
      if (comment)
        return Promise.resolve(comment);
      else
        return Promise.reject("Comment doesn't exist");
    }).then(function(comment) {
      comment.replies.push(reply);
      return comment.save();
    }).then(function() {
      status.success = true;
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });
  }
});

module.exports = router;
