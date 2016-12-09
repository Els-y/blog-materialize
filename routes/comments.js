var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var Promise = require('bluebird');

var authority = require('../modules/authority');
var Article = require('../models/article');
var Comment = require('../models/comment');
var Reply = require('../models/reply');

router.post('/newcomment', csrfProtection, function(req, res, next) {
  var reg_articleId = /passage\/(.+)/;
  var articleId = reg_articleId.exec(req.headers.referer)[1];

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

  if (req.body.reply === 'false') {  // new comment
    Article.findById({_id: articleId}).exec().then(function(article) {
      if (article) return Promise.resolve(article);
      else return Promise.reject("Article doesn't exist");
    }).then(function(article) {
      var comment = new Comment({
        article: article,
        author: req.session.user,
        content: req.body.content,
        time: new Date().toISOString(),
        replies: []
      });
      return Promise.all([comment.save(), article]);
    }).spread(function(comment, article) {
      article.comments.push(comment);
      return article.save();
    }).then(function() {
      status.success = true;
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });
  } else {  // reply
    var reply = new Reply({
      author: req.session.user,
      content: req.body.content,
      time: new Date().toISOString()
    });

    Promise.all([Comment.findById({_id: req.body.commentId}).exec(), reply.save()]).spread(function(comment, reply) {
      if (comment) {
        comment.replies.push(reply);
        return comment.save();
      } else {
        return Promise.reject("Comment doesn't exist");
      }
    }).then(function(comment) {
      status.success = true;
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });
  }
});

module.exports = router;
