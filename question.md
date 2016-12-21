# 遇到的问题及解决方法
## req.headers

## Jade如何访问到req.session.user
在app.js中添加
```javascript
app.use(function(req, res, next) {
  res.locals.user = req.session.user || null;
  console.log(res.locals.user);
  next();
});
```

## Jade直接渲染
```javascript
var jade = require('jade');
var fs = require('fs');

var cp = jade.compile(fs.readFileSync('*.jade'));
console.log(cp({*: *}));
```

## Jade使用moment
app.js
```javascript
app = express();
app.locals.moment = require('moment');
```

## Node.js获取系统环境变量
比如要获取环境变量里的 PATH,
设置的时候要用 **export** 声明
```javascript
var path = process.env.PATH;
```

## Nodemailer
[nodemailer　发送邮件](http://blog.csdn.net/elliott_yoho/article/details/53100227)

## JS data
### Date() 与 new Date()
```javascript
var a = Date();  // 字符串
var b = new Date();  // 对象
```

### 获取n分钟后的Date
```javascript
var now = new Date();
var nMinutesAfter = new Date(now.getTime() + n * 60000);
```

## 特殊字符编码
> **/**

```javascript
encodeURIComponent()
decodeURIComponent()
```

## 回到顶端
```javascript
$('.back-to-top').click(function() {
  $('html,body').animate({
    scrollTop: 0
  }, 500);
  return false;
});
```

## Cookie使用记录登录状态
### 客户端向服务器发送请求时携带的cookie获取
req.cookies
### 服务器
* 向客户端响应时写入cookie
    * res.cookie(name, value [, options]);
* 清除cookie
    * res.clearCookie(name [, options]);

## mongoose
### use bluebird
```javascript
var mongoose = require('mongoose);
mongoose.Promise = require('bluebird);
```

### Promise
* query **不是** *Promise*，要用 .exec() 获取 Promise。即 User.findOne 那些。
* save 是 *Promise*。即 user.save()。

### Populate
{type: , ref: }
### middleware
* pre
前执行
* post
后执行

> https://github.com/Automattic/mongoose/issues/964
> by design. there are docs involved to call hooks on.
>
> correction, there are no docs to call hooks on.
> 
> yes that is correct. Model.update,findByIdAndUpdate,findOneAndUpdate,findOneAndRemove,findByIdAndRemove are all commands executed directly in the database.


## Js
### 重载当前页面
```javascript
window.location.reload();
```
### 跳转同域名页面
```javascript
window.location.href = '/articles'
```