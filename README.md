#Microblog

##功能需求
* 文章
	* 发表、删除、修改
	* 分类加标签
	* 统计浏览次数
* 评论
	* **只有登录了的用户可以使用评论功能！！**
	* 评论、回复、删除(回复评论只能回复一级)
	* 统计评论个数
* 消息
	* **只有登录了的用户会有消息！！**
    * 评论/回复评论时通知对方
	* 使用必须登录的功能时提醒登录
	* 管理员文章被修改时
	* 反馈信息给所有者
* 用户
    * 登入、登出
    * 注册
    * 修改个人信息
    * 博客所有者
    	* 授权
    	* 修改文章

##用户权限
* 用户
    * 评论
    * 修改个人信息
* 管理员(附加)
    * 发表、修改、删除自己的文章
    * 删除评论
* 博客所有者(附加)
    * 所有文章修改

##数据库模型
* 用户
	* id (integer)
    * username (string，长度3-10，[0-9a-zA-Z-_])
    * email (string)
    * password (string，长度6-18，[0-9a-zA-Z+-*/=!?@_])
    * avatar (string link)
    * registDate (date)
    * confirmDate 发送激活时间(date)
    * confirmed 是否激活(bool)
    * role 身份(integer 0: 普通用户，1: 管理员，2: 所有者)
* 文章
	* index (string)
    * title (string)
    * content (string)
    * author (string)
    * categories (array)
    * publishDate (date)
    * updateDate (date)
    * pageviews (integer)
* 评论
    * id (integer)
    * articleTitle (string)
    * author (string)
    * content (string)
    * deep(integer)
    * fromCommet (ObjectId)

##视图
* 主页
* 文章列表页
* 文章单页
* 关于我
* 个人信息页、修改信息
* 管理员/root界面
