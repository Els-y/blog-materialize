var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var articleScheMa = new Schema({
  title: String,
  author: {type: Schema.Types.ObjectId, ref: 'users'},
  content: String,
  intro: String,
  categories: [{type: Schema.Types.ObjectId, ref: 'categories'}],
  comments: [{type: Schema.Types.ObjectId, ref: 'comments'}],
  publishDate: Date,
  updateDate: Date,
  pageviews: Number
});

module.exports = mongoose.model('articles', articleScheMa);
