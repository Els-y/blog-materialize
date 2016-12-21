# Microblog
一个用 *Express*、*MongoDB*、*Materialize* 搭建的小型博客。

由于本人也只是基本学了下这些框架，第一次写个小型博客来练练手，功能还未完全实现，可能还有些小细节没有注意到，如果有发现哪里有 *bug* 或者好的建议，请不吝指出，谢谢。

> 在线预览: http://118.89.16.142/

## 使用方法
首先，根据自己需要改写 **modules/config.js** 的 `secret` 和 `mailServer`。

`secret` 在加密部分使用。
`mailServer` 用以发送确认邮件来实现确认账户和找回密码。

```javascript
secret: process.env.BLOG_SECRET,
...
mailServer: {
  host: process.env.MAIL_HOST,
  secureConnection: true,
  port: parseInt(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  }
},
```
例如，使用 163 邮箱的 SMTP。
```javascript
secret: 'microblogsecret',
...
mailServer: {
  host: 'smtp.163.com',
  secureConnection: true,
  port: 465,
  auth: {
    user: 'yourUsername@163.com',
    pass: 'yourPassword',
  }
},
```
当然，最好还是在系统环境变量里设置这些值。

然后，根据需要更改文件 **bin/www** 中的数据库连接，默认为
```javascript
mongoose.connect('mongodb://localhost/microblog');
```

上述操作完成后就可以使用了。

## 介绍
基本的功能还有数据模型

### 功能
* 文章
	* 发表、删除、修改
	* 分类加标签
* 评论
	* **只有登录了的用户可以使用评论功能**
	* 评论、回复、删除 (回复评论只能回复一级)
* 用户
    * 登入、登出
    * 注册
    * 找回密码、更改密码
    * 修改个人信息

### 用户权限
* 用户
    * 添加、删除评论
    * 修改个人信息
* 管理员(附加)
    * 发表、修改、删除自己的文章
    * 删除自己文章下的评论
      不能直接删除**博客所有者**的评论，可以间接删除含**博客所有者**评论的文章或者含博客所有者回复的非博客所有者的评论
* 博客所有者(附加)
    * 所有文章修改、删除
    * 所有评论删除

### 数据库模型
* User
	* id (ObjectId)
    * username (String，长度3-10，[0-9a-zA-Z-_])
    * email (String)
    * password (String，长度6-18，[0-9a-zA-Z+-*/=!?@_])
    * avatar (String link)
    * registDate (Date)
    * confirmDate 发送激活时间(Date)
    * confirmed 是否激活(Boolean)
    * role 身份(Number 0: 普通用户，1: 管理员，2: 所有者)
    * encrypt 密码是否已经加密(Boolean)
* Article
	* id (ObjectId)
    * title (String)
    * author (ref: ObjectId)
    * content (String)
    * intro (String)
    * categories (ref: ObjectId, array)
    * comments (ref: ObjectId, array)
    * publishDate (Date)
    * updateDate (Date)
    * pageviews (Number)
* Category 分类
	* id (ObjectId)
	* name (String)
	* count (Number)
	* articles (ref: ObjectId, array)
* Comment
    * id (ObjectId)
    * article (ref: ObjectId)
    * author (ref: ObjectId)
    * content (String)
    * time (Data)
    * replies (ref: ObjectId, array)
* Reply
	* id (ObjectId)
	* article (ref: ObjectId)
	* author (ref: ObjectId)
	* content (String)
	* time (Data)
* Avatar
	* id (ObjectId)
	* name (String)
	* src (String)

### 视图
* 主页
* 文章列表页
* 文章单页
* 个人信息页