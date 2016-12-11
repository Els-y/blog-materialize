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
  var newestCommentsPromise = Comment.find().populate('author article').sort({'time': 'desc'}).limit(config.newestCommentSize).exec();

  Promise.all([articlePromise, categoryPromise, articleCount, newestCommentsPromise]).spread(function(articles, categories, articlesSize, newestComments) {
    var pageSum = Math.ceil(articlesSize / config.pageSize);
    if (pageSum === 0) pageSum = 1;
    if (pageNum > pageSum) return res.redirect('/articles/page/' + pageSum);

    console.log(newestComments);

    res.render('articles/articles', {
      articleList: articles,
      csrfToken: req.csrfToken(),
      pageNum: pageNum,
      pageSum: pageSum,
      categories: categories,
      pageBarSize: config.pageBarSize,
      newestComments: newestComments
    });
  }).catch(function(reason) {
    res.send(util.inspect(reason));
  });
});

router.get('/categories/:tag', csrfProtection, function(req, res, next) {
  var categoryPromise = Category.find().sort({'name': 'asc'}).exec();
  var queryCategoryPromise = Category.findOne({'name': req.params.tag}).populate('articles', 'title intro updateDate').exec();
  var newestCommentsPromise = Comment.find().populate('author article').sort({'time': 'desc'}).limit(config.newestCommentSize).exec();

  Promise.all([queryCategoryPromise, categoryPromise, newestCommentsPromise]).spread(function(queryCategory, categories, newestComments) {
    res.render('articles/articles', {
      articleList: queryCategory.articles,
      csrfToken: req.csrfToken(),
      pageNum: 1,
      pageSum: 1,
      categories: categories,
      pageBarSize: config.pageBarSize,
      newestComments: newestComments
    });
  }).catch(function(reason) {
    // res.send(util.inspect(reason));
    res.redirect('/articles');
  });
});

router.get('/passage/:articleId', csrfProtection, function(req, res, next) {
  var populateParams = [
    {
      path: 'author',
      select: 'username role avatar'
    },
    {
      path: 'categories',
      select: 'name'
    },
    {
      path: 'comments',
      select: 'author content time replies',
      populate: [
        {
          path: 'author',
          select: 'username avatar role -_id'
        },
        {
          path: 'replies',
          populate: {
            path: 'author',
            select: 'username avatar role -_id'
          }
        }
      ]
    }
  ];
  var articlePromise = Article.findById(req.params.articleId).populate(populateParams).exec().then(function(article) {
    res.render('articles/passage', {
      csrfToken: req.csrfToken(),
      article: article,
    });
  }).catch(function(reason) {
    res.redirect('/articles');
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

// delete
router.post('/delete', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    err: null
  };

  if (!req.session.user) {
    status.err = 'Please login first';
    return res.send(status);
  } else if (req.session.user.role === 0) {
    status.err = "Permission isn't enough";
    return res.send(status);
  }

  if (!req.body._id) {
    status.err = "Invalid operation";
    return res.send(status);
  }

  Article.findById(req.body._id).populate('author').then(function(article) {
    if (article) {
      if (req.session.user.role === 2 || (req.session.user.role === 1 && req.session.user.username === article.author.username))
        return Promise.resolve(article);
      else
        return Promise.reject("Permission isn't enough");
    } else {
      return Promise.reject("Article doesn't exist");
    }
  }).then(function(article) {
    return Promise.all([
      Reply.remove({article: article}),
      Comment.remove({article: article}),
      article.remove(),
      Category.update({articles: {$in: [article._id]}}, {$inc: {count: -1}, $pull: {articles: article._id}}, {multi: true}).exec()
    ]);
  }).spread(function() {
    return Category.remove({count: 0});
  }).then(function() {
    status.success = true;
  }).catch(function(reason) {
    status.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

// modify edit
router.get('/modify', csrfProtection, authority.checkIfAdmin);
router.get('/modify', csrfProtection, function(req, res, next) {
  var reg_articleId = /passage\/(.+)/;
  var articleId = reg_articleId.exec(req.headers.referer);

  if (!articleId) {
    return res.redirect('/');
  }

  Article.findById(articleId[1]).populate('author').exec().then(function(article) {
    if (article && (req.session.user.role === 2 || (req.session.user.role === 1 && req.session.user.username === article.author.username))) {
      return Promise.resolve(article);
    } else {
      return Promise.reject();
    }
  }).then(function(article) {
    res.render('articles/edit', {
      csrfToken: req.csrfToken(),
      article: article
    });
  }).catch(function() {
    res.redirect('/');
  });
});

router.post('/getArticle', csrfProtection, authority.checkIfAdmin);
router.post('/getArticle', csrfProtection, function(req, res, next) {
  var nullArticle = {
    content: 'Error',
    categories: []
  };
  Article.findById(req.body._id).populate('categories').exec().then(function(article) {
    if (article) res.send(article);
    else res.send(nullArticle);
  });
});

router.post('/modify/submit', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    data: {
      title: req.body.title,
      err: null,
    }
  };

  var categories = _.uniq(_.filter(req.body.categories.split('+-+'), function(tag) {return tag !== '';}));

  if (!req.session.user) {
    status.data.err = 'Please login first';
    return res.send(status);
  } else if (!req.body._id) {
    status.data.err = 'Invalid operation';
    return res.send(status);
  }

  Article.findById(req.body._id).populate('categories').exec().then(function(article) {
    var addCategories = _.filter(categories, function(tag) {
      for (var i = 0; i < article.categories.length; ++i)
        if (article.categories[i].name === tag) return false;
      return true;
    });

    var removeCategories = _.filter(article.categories, function(tag) {
      for (var i = 0; i < categories.length; ++i)
        if (tag.name === categories[i]) return false;
      return true;
    });

    var removeId = _.map(removeCategories, function(tag) {
      return tag._id;
    });

    article.title = req.body.title;
    article.content = req.body.content;
    article.intro = req.body.intro;

    var promiseAll = [article.save(), addCategories.length];
    _.forEach(addCategories, function(tag, index) {
      var addtag = new Category({
        name: tag,
        count: 1,
        articles: article
      });
      promiseAll.push(addtag.save());
    });

    _.forEach(removeCategories, function(tag, index) {
      promiseAll.push(Article.update({_id: article._id}, {$pull: {categories: tag._id}}).exec());
    });

    promiseAll.push(Category.update({_id: {$in: removeId}}, {$inc: {count: -1}}, {multi: true}).exec());
    return Promise.all(promiseAll);
  }).spread(function() {
    var article = arguments[0];
    var addLength = arguments[1];
    var addCategories = Array.prototype.slice.call(arguments, 2, addLength + 2);
    var promiseAll = [];
    promiseAll.push(Article.update({_id: article._id}, {$push: {categories: {$each: addCategories}}}).exec());
    promiseAll.push(Category.remove({count: {$lt: 1}}));

    return Promise.all(promiseAll);
  }).spread(function() {
    status.success = true;
  }).catch(function(reason) {
    status.data.err = 'errrrr';
  }).finally(function() {
    res.send(status);
  });
});

module.exports = router;
