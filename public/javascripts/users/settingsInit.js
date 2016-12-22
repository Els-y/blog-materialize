(function() {
  $(function() {
   $('ul.user-settings-tabs').tabs();
  });
})();

// resend-confirm
(function() {
  $(function() {
    $('.resend-confirm').click(resendConfirmMail);
  });

  function resendConfirmMail() {
    $.get('/confirm/resend', null, function(data, status) {
      if (data.success) {
        Materialize.toast('Confirm message has been resend', 4000);
      } else {
        Materialize.toast(data.data.err, 1000);
      }
    });
    return false;
  }
})();


// avatar
(function() {
  $(function() {
    $('#tab-information .avatar-list img').click(avatarHandler);
    $('#tab-information .avatar-save').click(saveHandler);
  });

  function avatarHandler() {
    $('.card-image img').attr('src', $(this).attr('src'));
  }

  function saveHandler() {
    var postData = {
      avatar: $('.card-image img').attr('src'),
      _csrf: $('.change-form input[name="_csrf"]').val()
    };

    $.post('/users/changeavatar', postData, function(response, status) {
      if (response.success) {
        Materialize.toast('Success', 1500);
      } else {
        Materialize.toast(response.err, 1500);
      }
    });
  }
})();

// change-form
(function() {
  var validator = {
    wrongMessage: {
      'password': 'Invalid password',
      'confirm': 'Passwords are not consistent',
    },
    checkPassword: function(password) {
      return /^[0-9a-zA-Z+\-*/=!?@_]{6,18}$/.test(password);
    },
    checkSame: function(password, confirmPassword) {
      return password == confirmPassword;
    },
    invalidChangeForm: function(oldPassword, newPassword, confirm) {
      if (!this.checkPassword(oldPassword) || !this.checkPassword(newPassword) || !this.checkPassword(confirm)) {
        Materialize.toast(this.wrongMessage.password, 1000);
        return true;
      } else if (!this.checkSame(confirm, newPassword)) {
        Materialize.toast(this.wrongMessage.confirm, 1000);
        return true;
      }
      return false;
    }
  };

  function changeFormSubmitHandler() {
    var oldpassword = $('.change-form #change-oldpassword').val();
    var newpassword = $('.change-form #change-newpassword').val();
    var confirmnew = $('.change-form #change-confirmnew').val();
    var _csrf = $('.change-form input[name="_csrf"]').val();

    var postData = {
      oldpassword: oldpassword,
      newpassword: newpassword,
      confirmnew: confirmnew,
      _csrf: _csrf
    };

    if (!validator.invalidChangeForm(oldpassword, newpassword, confirmnew)) {
      $.post('/users/changepassword', postData, function(data, status) {
        if (data.success) {
          Materialize.toast('Revise successfully', 4000);
          $('.change-form #change-oldpassword').val('');
          $('.change-form #change-newpassword').val('');
          $('.change-form #change-confirmnew').val('');
        } else {
          Materialize.toast(data.err, 1000);
        }
      });
    }

    return false;
  }

  $(function() {
    $('.change-form .btn').click(changeFormSubmitHandler);
  });
})();
