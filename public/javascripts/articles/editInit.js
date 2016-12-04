$(function() {
  $('.chips').material_chip();
  $('.chips-placeholder').material_chip({
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '+Category',
  });

  var getAutoHeight = function() {
    var $autoheight = $('div[autoheight]');
    var $editContainer = $('.edit-container');
    var $info = $editContainer.find('.info');
    var subtractHeight = $('.nav-wrapper').height() + $info.height() + parseInt($editContainer.css('margin-top').slice(0, -2)) + parseInt($info.css('margin-bottom').slice(0, -2)) + 10;

    return $(window).height() - subtractHeight;
  };

  var setAutoHeight = function() {
    var height = getAutoHeight();

    $('div[autoheight]').height(height);
    $('.CodeMirror').height(height);
  };

  setAutoHeight();
  $(window).resize(setAutoHeight);
});
