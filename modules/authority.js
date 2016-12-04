function checkHasLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}

function checkIfAdmin(req, res, next) {
  if (req.session.user && req.session.user.role !== 0) {
    next();
  } else {
    return res.redirect('/');
  }
}

exports.checkHasLogin = checkHasLogin;
exports.checkNotLogin = checkNotLogin;
exports.checkIfAdmin = checkIfAdmin;
