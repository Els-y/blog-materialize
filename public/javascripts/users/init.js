(function() {
  $(function() {
   $('ul.user-settings-tabs').tabs();
   $('#tab-information .btn').click(function() {
     Materialize.toast('Still in development', 1500);
   });
  });
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

    var postData = {
      oldpassword: oldpassword,
      newpassword: newpassword,
      confirmnew: confirmnew
    };

    console.log(postData);

    if (!validator.invalidChangeForm(oldpassword, newpassword, confirmnew)) {
      $.post('/users/changepassword', postData, function(data, status) {
        if (data.success) {
          Materialize.toast('Your password has been revised successfully', 4000);
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
