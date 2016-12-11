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
    Article.findById(articleId).exec().then(function(article) {
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

    Promise.all([Article.findById(articleId).exec(), Comment.findById(req.body.commentId).exec(), reply.save()]).spread(function(article, comment, reply) {
      if (!comment) {
        return Promise.reject("Comment doesn't exist");
      } else if (!article) {
        return Promise.reject("Article doesn't exist");
      } else  {
        reply.article = article;
        comment.replies.push(reply);
        return Promise.all([reply.save(), comment.save()]);
      }
    }).spread(function() {
      status.success = true;
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });
  }
});

router.post('/removereply', csrfProtection, authority.checkHasLogin);
router.post('/removereply', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    err: null
  };

  if (!req.body._id) {
    status.err = "Invalid operation";
    return res.send(status);
  }

  Reply.findById(req.body._id).populate('author', 'username role').then(function(reply) {
    if (reply) {
      if (req.session.user.role === 2 || (req.session.user.role === 1 && reply.author.role !== 2) || reply.author.username == req.session.user.username)
        return Promise.resolve(reply);
      else
        return Promise.reject("Permission isn't enough");
    } else {
      return Promise.reject("Reply doesn't exist");
    }
  }).then(function(reply) {
    return Promise.all([Comment.update({replies: {$in: [reply._id]}}, {$pull: {replies: reply._id}}).exec(), Reply.remove({_id: reply._id}).exec()]);
  }).spread(function() {
    status.success = true;
  }).catch(function(reason) {
    status.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

router.post('/removecomment', csrfProtection, authority.checkHasLogin);
router.post('/removecomment', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    err: null
  };

  if (!req.body._id) {
    status.err = "Invalid operation";
    return res.send(status);
  }

  Comment.findById(req.body._id).populate('author', 'username role').then(function(comment) {
    if (comment) {
      if (req.session.user.role === 2 || (req.session.user.role === 1 && comment.author.role !== 2) || comment.author.username == req.session.user.username)
        return Promise.resolve(comment);
      else
        return Promise.reject("Permission isn't enough");
    } else {
      return Promise.reject("Comment doesn't exist");
    }
  }).then(function(comment) {
    return Promise.all([Reply.remove({_id: {$in: comment.replies}}).exec(), comment.remove()]);
  }).spread(function() {
    status.success = true;
  }).catch(function(reason) {
    status.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

module.exports = router;
