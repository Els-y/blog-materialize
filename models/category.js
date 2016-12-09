var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var categoryScheMa = new Schema({
  name: String,
  count: Number,
  articles: [{type: Schema.Types.ObjectId, ref: 'articles'}]
});

module.exports = mongoose.model('categories', categoryScheMa);
