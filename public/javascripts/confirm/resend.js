(function() {
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

  $(function() {
    $('.resend-confirm').click(resendConfirmMail);
  });
})();
