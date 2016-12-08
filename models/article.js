var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var articleScheMa = new Schema({
  title: String,
  author: String,
  content: String,
  intro: String,
  categories: [],
  publishDate: Date,
  updateDate: Date,
  pageviews: Number
});

module.exports = mongoose.model('articles', articleScheMa);
