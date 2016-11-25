// login and regist form
(function() {
  var validator = {
    wrongMessage: {
      'username': 'Invalid username',
      'password': 'Invalid password',
      'confirm': 'Passwords are not consistent',
      'email': 'Invalid email'
    },
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
    },
    invalidLoginForm: function(username, password) {
      if (!this.checkUsername(username)) {
        Materialize.toast(this.wrongMessage.username, 1000);
        return true;
      } else if (!this.checkPassword(password)) {
        Materialize.toast(this.wrongMessage.password, 1000);
        return true;
      }
      return false;
    },
    invalidRegistForm: function(username, email, password, confirm) {
      if (!this.checkUsername(username)) {
        Materialize.toast(this.wrongMessage.username, 1000);
        return true;
      } else if (!this.checkEmail(email)) {
        Materialize.toast(this.wrongMessage.email, 1000);
        return true;
      } else if (!this.checkPassword(password)) {
        Materialize.toast(this.wrongMessage.password, 1000);
        return true;
      } else if (!this.checkPassword(confirm)) {
        Materialize.toast(this.wrongMessage.password, 1000);
        return true;
      } else if (!this.checkSame(password, confirm)) {
        Materialize.toast(this.wrongMessage.confirm, 1000);
        return true;
      }
      return false;
    }
  };

  function loginFormSubmitHandler() {
    var username = $('#slide-login #login-username').val();
    var password = $('#slide-login #login-password').val();
    var remember_me = $('#login-remember_me').prop('checked');
    var _csrf = $('#slide-login input[name="_csrf"]').val();

    var postData = {
      username: username,
      password: password,
      remember_me: remember_me,
      _csrf: _csrf
    };

    if (!validator.invalidLoginForm(username, password)) {
      $.post('/login', postData, function(data, status) {
        if (data.success) {
          $('.button-collapse').sideNav('hide');
          Materialize.toast('Welcome again', 4000);
          updateNavbar(data.data.username, data.data.navbarHtml);
        } else {
          Materialize.toast(data.data.err, 1000);
        }
      });
    }

    return false;
  }

  function registFormSubmitHandler() {
    var username = $('#slide-regist #regist-username').val();
    var email = $('#slide-regist #regist-email').val();
    var password = $('#slide-regist #regist-password').val();
    var confirm = $('#slide-regist #regist-confirm').val();
    var _csrf = $('#slide-login input[name="_csrf"]').val();

    var postData = {
      username: username,
      email: email,
      password: password,
      confirm: confirm,
      _csrf: _csrf
    };

    if (!validator.invalidRegistForm(username, email, password, confirm)) {
      $.post('/regist', postData, function(data, status) {
        if (data.success) {
          $('.button-collapse').sideNav('hide');
          Materialize.toast('Please confirm your account', 4000);
          updateNavbar(data.data.username);
        } else {
          Materialize.toast(data.data.err, 1000);
        }
      });
    }

    return false;
  }

  function updateNavbar(username) {
    $(".navbar .right").remove();
    var html = '<ul id="dropdown-logined" class="dropdown-content">' +
               '<li><a href="/users/settings" class="deep-purple-text">Settings</a></li>' +
               '<li class="divider"></li>' +
               '<li><a href="/logout" class="deep-purple-text">Sign out</a></li>' +
               '</ul>' +
               '<ul class="right hide-on-med-and-down">' +
               '<li><a href="" data-activates="dropdown-logined" class="dropdown-button">#{username}</a></li>' +
               '</ul>';

    html = html.replace(/#\{username\}/g, username);

    $(".navbar .row").append(html);
    $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true // Displays dropdown below the button
      }
    );
  }

  $(function() {
    $('#slide-login .btn').click(loginFormSubmitHandler);
    $('#slide-regist .btn').click(registFormSubmitHandler);
  });
})();

// forgot-form
(function() {
  var validator = {
    wrongMessage: {
      'username': 'Invalid username',
      'email': 'Invalid email'
    },
    checkUsername: function(username) {
      return /^[a-zA-Z][0-9a-zA-Z_\-]{2,9}$/.test(username);
    },
    checkEmail: function(email) {
      return /^\w+([-+.]\w+)*@(([0-9a-zA-Z_\-]+\.)+[a-zA-Z]{2,4})$/.test(email);
    },
    invalidForgotForm: function(username, email) {
      if (!this.checkUsername(username)) {
        Materialize.toast(this.wrongMessage.username, 1000);
        return true;
      } else if (!this.checkEmail(email)) {
        Materialize.toast(this.wrongMessage.email, 1000);
        return true;
      }
      return false;
    }
  };

  function forgotFormSubmitHandler() {
    var username = $('.forgot-form #forgot-username').val();
    var email = $('.forgot-form #forgot-email').val();
    var _csrf = $('#slide-login input[name="_csrf"]').val();

    var postData = {
      username: username,
      email: email,
      _csrf: _csrf
    };

    if (!validator.invalidForgotForm(username, email)) {
      $.post('/forgot', postData, function(data, status) {
        if (data.success) {
          $('#forgot-modal').modal('close');
          $('.forgot-form #forgot-username').val('');
          $('.forgot-form #forgot-email').val('');
          Materialize.toast('Confirm email has been sent', 4000);
        } else {
          Materialize.toast(data.data.err, 1000);
        }
      });
    }

    return false;
  }

  $(function() {
    $('.forgot-form .btn').click(forgotFormSubmitHandler);
  });
})();
