(function() {
  $(function() {
    $('.slider').slider({
      full_width: true,
      height: 700
    });
    $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true // Displays dropdown below the button
    });
    $('.button-collapse').sideNav({
      menuWidth: 370, // Default is 240
      edge: 'right', // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
    initFixedActionBtn();
  });

  function initFixedActionBtn() {
    $('.back-to-top').click(function() {
      $('html,body').animate({
        scrollTop: 0
      }, 500);
      return false;
    });

    $('.write-article, .feedback').click(function() {
      Materialize.toast('Still in development', 1500);
    });
  }
})();
