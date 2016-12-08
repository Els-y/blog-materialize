$(function() {
  // marked
  var markedRender = new marked.Renderer();
  marked.setOptions({
    renderer: markedRender,
    gfm: true,
    tables: true,
    breaks: true,  // '>' 换行，回车换成 <br>
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

  // codemirror editor
  var editor = CodeMirror.fromTextArea($('#edit-content').get(0), {
    mode: 'markdown',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    lineWrapping: true,  // 长句子折行
    theme: "default",
    keyMap: 'sublime',
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
  });

  editor.on('change', function(cm, co) {
    $('.markdown-body').html(marked(cm.getValue()));
    $('.markdown-body pre code').each(function(i, block) {
      Prism.highlightElement(block);
    });
  });

  var getAutoHeight = function() {
    var $autoheight = $('div[autoheight]');
    var $editContainer = $('.edit-container');
    var $info = $editContainer.find('.info');
    var subtractHeight = $('.nav-wrapper').height() + $info.height() + parseInt($editContainer.css('margin-top').slice(0, -2)) + parseInt($info.css('margin-bottom').slice(0, -2)) + 10;

    return $(window).height() - subtractHeight;
  };

  $('.CodeMirror').height(getAutoHeight());

  // publish
  $('#editor-publish').click(function() {
    var title = $('#edit-title').val();
    var content = editor.getValue();
    var intro = $('.edit-preview').text().slice(0, 150);
    var categories = $('.chips-placeholder').find('.chip').map(function() {
      return this.innerText.replace('close','');
    }).toArray();
    var _csrf = $('.edit-form input[name="_csrf"]').val();

    var postData = {
      title: title,
      categories: categories.join('+-+'),
      content: content,
      intro: intro,
      _csrf: _csrf
    };

    if (!title || !content || !intro) {
      Materialize.toast('Incomplete information', 3000);
    } else {
      $.post('/articles/edit/addnew', postData, function(response, status) {
        if (response.success) {
          window.location = '/articles';
        } else {
          Materialize.toast(response.data.err, 3000);
        }
      });
    }

    return false;
  });

});
