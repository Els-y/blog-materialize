# Microblog
一个用 *Express*、*MongoDB*、*Materialize* 搭建的小型博客。

由于本人也只是基本学了下这些框架，第一次写个小型博客来练练手，功能还未完全实现，可能还有些小细节没有注意到，如果有发现哪里有 *bug* 或者好的建议，请不吝指出，谢谢。

## 功能需求
* 文章
	* 发表、删除、修改
	* 分类加标签
	* 统计浏览次数 (暂不需要)
* 评论
	* **只有登录了的用户可以使用评论功能**
	* 评论、回复、删除(回复评论只能回复一级)
	* 统计评论个数 (暂不需要)
* 消息 (未实现)
	* **只有登录了的用户会有消息**
    * 评论/回复评论时通知对方
	* 使用必须登录的功能时提醒登录
	* 管理员文章被修改时
	* 反馈信息给**所有者**
* 用户
    * 登入、登出
    * 注册
    * 找回密码、更改密码
    * 修改个人信息

## 用户权限
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

## 数据库模型
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

## 视图
* 主页
* 文章列表页
* 文章单页
* 个人信息页