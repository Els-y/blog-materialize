var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var Promise = require('bluebird');
var marked = require('marked');
var util = require('util');

var _ = require('lodash');

var authority = require('../modules/authority');
var config = require('../modules/config');
var Article = require('../models/article');
var Comment = require('../models/comment');
var Reply = require('../models/reply');
var Category = require('../models/category');

/* GET users listing. */
router.get('/', csrfProtection, function(req, res, next) {
  res.redirect('/articles/page/1');
});

router.get('/page/:pageNum', csrfProtection, function(req, res, next) {
  var pageNum = parseInt(req.params.pageNum);
  var start = (pageNum - 1) * config.pageSize;

  if (pageNum < 1) return res.redirect('/articles/page/1');

  var articlePromise = Article.find().sort({'updateDate': 'desc'}).skip(start).limit(config.pageSize).exec();
  var articleCount = Article.count().exec();
  var categoryPromise = Category.find().sort({'name': 'asc'}).exec();

  Promise.all([articlePromise, categoryPromise, articleCount]).spread(function(articles, categories, articlesSize) {
    var pageSum = Math.ceil(articlesSize / config.pageSize);
    if (pageSum === 0) pageSum = 1;
    if (pageNum > pageSum) return res.redirect('/articles/page/' + pageSum);

    res.render('articles/articles', {
      articleList: articles,
      csrfToken: req.csrfToken(),
      pageNum: pageNum,
      pageSum: pageSum,
      categories: categories,
      pageBarSize: config.pageBarSize
    });
  }).catch(function(reason) {
    res.send(util.inspect(reason));
  });
});

router.get('/passage/:articleId', csrfProtection, function(req, res, next) {
  var comments = {
    path: 'comments',
    select: 'author content time replies',
    populate: [
      {
        path: 'author',
        select: 'username avatar -_id'
      },
      {
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar -_id'
        }
      }
    ]
  };
  var articlePromise = Article.findById(req.params.articleId).populate([{path: 'author', select: 'username avatar'}, {path: 'categories', select: 'name'}, comments]).exec().then(function(article) {
    res.render('articles/passage', {
      csrfToken: req.csrfToken(),
      article: article,
    });
  }).catch(function(reason) {
    res.send(util.inspect(reason));
  });
});

// add new passage
router.get('/edit', authority.checkIfAdmin);
router.get('/edit', csrfProtection, function(req, res, next) {
  res.render('articles/edit', {csrfToken: req.csrfToken()});
});

router.post('/edit/addnew', csrfProtection, authority.checkIfAdmin);
router.post('/edit/addnew', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    data: {
      title: req.body.title,
      err: null,
    }
  };

  if (!req.body.title || !req.body.content || !req.body.intro) {
    status.data.err = 'Incomplete information';
    return res.send(status);
  }

  var nowtime = new Date().toISOString();
  var categories = _.uniq(_.filter(req.body.categories.split('+-+'), function(tag) {return tag !== '';}));

  var articleInfo = {
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    intro: req.body.intro,
    publishDate: nowtime,
    updateDate: nowtime,
    pageviews: 0
  };

  var post = new Article(articleInfo);
  var queryPromise = [post.save()];
  for (var i = 0; i < categories.length; ++i) {
    queryPromise.push(Category.findOne({name: categories[i]}).exec());
  }

  Promise.all(queryPromise).spread(function() {
    // 1 ~ end is categoriesPromise
    var nextPromise = Array.prototype.slice.call(arguments, 0);
    for (var i = 1; i < nextPromise.length; ++i) {
      if (!nextPromise[i]) {
        var addtag = new Category({
          name: categories[i - 1],
          count: 0,
        });
        nextPromise[i] = addtag.save();
      }
    }

    return Promise.all(nextPromise);
  }).spread(function() {
    var savedPost = arguments[0];
    var queryCategories = Array.prototype.slice.call(arguments, 1, arguments.length);
    var savePromise = [];

    queryCategories.forEach(function(tag, index) {
      if (tag) {
        tag.articles.push(savedPost);
        tag.count++;
        savedPost.categories.push(tag);
        savePromise.push(tag.save());
      }
    });
    savePromise.push(savedPost.save());
    return Promise.all(savePromise);
  }).spread(function() {
    status.success = true;
  }).catch(function(reason) {
    status.data.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

router.get('/categories/:tag', csrfProtection, function(req, res, next) {
  var categoryPromise = Category.find().sort({'name': 'asc'}).exec();
  var queryCategoryPromise = Category.findOne({'name': req.params.tag}).populate('articles', 'title intro updateDate').exec();

  Promise.all([queryCategoryPromise, categoryPromise]).spread(function(queryCategory, categories) {
    res.render('articles/articles', {
      articleList: queryCategory.articles,
      csrfToken: req.csrfToken(),
      pageNum: 1,
      pageSum: 1,
      categories: categories,
      pageBarSize: config.pageBarSize
    });
  }).catch(function(reason) {
    res.send(util.inspect(reason));
  });
});

module.exports = router;
