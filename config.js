module.exports = {
  secret: process.env.BLOG_SECRET,
  cookie: {
    maxAge: 600000
  },
  mailServer: {
    host: process.env.MAIL_HOST,
    secureConnection: true,
    port: parseInt(process.env.MAIL_PORT),
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    }
  },
  protocol: 'http'
};