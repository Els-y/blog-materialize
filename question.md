#遇到的问题及解决方法
##Jade如何访问到req.session.user
在app.js中添加
~~~javascript
app.use(function(req, res, next) {
  res.locals.user = req.session.user || null;
  console.log(res.locals.user);
  next();
});
~~~

##Jade直接渲染
~~~javascript
var jade = require('jade');
var fs = require('fs');

var cp = jade.compile(fs.readFileSync('*.jade'));
console.log(cp({*: *}));
~~~

##Node.js获取系统环境变量
比如要获取环境变量里的 PATH,
设置的时候要用 **export** 声明
~~~javascript
var path = process.env.PATH;
~~~

##Nodemailer
[nodemailer　发送邮件](http://blog.csdn.net/elliott_yoho/article/details/53100227)

##JS data
###Date() 与 new Date()
~~~javascript
var a = Date();  // 字符串
var b = new Date();  // 对象
~~~

###获取n分钟后的Date
~~~javascript
var now = new Date();
var nMinutesAfter = new Date(now.getTime() + n * 60000);
~~~

##特殊字符编码
> **/**

~~~javascript
encodeURIComponent()
decodeURIComponent()
~~~

##回到顶端
~~~javascript
$('.back-to-top').click(function() {
  $('html,body').animate({
    scrollTop: 0
  }, 500);
  return false;
});
~~~

##Cookie使用记录登录状态
###客户端向服务器发送请求时携带的cookie获取
req.cookies
###服务器
* 向客户端响应时写入cookie
    * res.cookie(name, value [, options]);
* 清除cookie
    * res.clearCookie(name [, options]);