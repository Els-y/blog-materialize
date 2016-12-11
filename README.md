#Microblog

##功能需求
* 文章
	* 发表、删除、修改
	* 分类加标签
	* 统计浏览次数 (未实现)
* 评论
	* **只有登录了的用户可以使用评论功能**
	* 评论、回复、删除(回复评论只能回复一级)
	* 统计评论个数 (未实现)
* 消息 (未实现)
	* **只有登录了的用户会有消息**
    * 评论/回复评论时通知对方
	* 使用必须登录的功能时提醒登录
	* 管理员文章被修改时
	* 反馈信息给所有者
* 用户
    * 登入、登出
    * 注册
    * 找回密码、更改密码
    * 修改个人信息
    * 博客所有者
    	* 修改文章

##用户权限
* 用户
    * 评论
    * 修改个人信息
    * 删除自己的评论
* 管理员(附加)
    * 发表、修改、删除自己的文章
    * 删除评论
* 博客所有者(附加)
    * 所有文章修改

##数据库模型
* 用户
	* id (ObjectId)
    * username (String，长度3-10，[0-9a-zA-Z-_])
    * email (String)
    * password (String，长度6-18，[0-9a-zA-Z+-*/=!?@_])
    * avatar (String link)
    * registDate (Date)
    * confirmDate 发送激活时间(Date)
    * confirmed 是否激活(Boolean)
    * role 身份(Number 0: 普通用户，1: 管理员，2: 所有者)
* 文章
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
* 分类
	* id (ObjectId)
	* name (String)
	* count (Number)
* 评论
    * id (ObjectId)
    * article (ref: ObjectId)
    * author (ref: ObjectId)
    * content (String)
    * time (Data)
    * replies (ref: ObjectId, array)
* 回复
	* id (ObjectId)
	* author (ref: ObjectId)
	* content (String)
	* time (Data)
* 头像
	* id (ObjectId)
	* name (String)
	* src (String)

##视图
* 主页
* 文章列表页
* 文章单页
* 个人信息页、修改信息
