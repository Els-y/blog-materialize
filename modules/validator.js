var validator = {
  checkUsername: function(username) {
    return /^[a-zA-Z][0-9a-zA-Z_\-]{2,9}$/.test(username);
  },
  checkPassword: function(password) {
    return /^[0-9a-zA-Z+\-*/=!?@_]{6,18}$/.test(password);
  },
  checkSame: function(password, confirmPassword) {
    return password == confirmPassword;
  },
  checkEmail: function(email) {
    return /^\w+([-+.]\w+)*@(([0-9a-zA-Z_\-]+\.)+[a-zA-Z]{2,4})$/.test(email);
  }
};

module.exports = validator;
