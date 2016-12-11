(function() {
  $(function() {
    $('.chips').material_chip();
    $('.chips-placeholder').material_chip({
      placeholder: 'Enter a tag',
      secondaryPlaceholder: '+Category',
    });
    $(window).resize(setAutoHeight);
    setAutoHeight();
  });

  function getAutoHeight() {
    var $autoheight = $('div[autoheight]');
    var $editContainer = $('.edit-container');
    var $info = $editContainer.find('.info');
    var subtractHeight = $('.nav-wrapper').height() + $info.height() + parseInt($editContainer.css('margin-top').slice(0, -2)) + parseInt($info.css('margin-bottom').slice(0, -2)) + 10;

    return $(window).height() - subtractHeight;
  }

  function setAutoHeight() {
    var height = getAutoHeight();
    $('div[autoheight]').height(height);
    $('.CodeMirror').height(height);
  }
})();

(function() {
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
    editor.on('change', editorOnHandler);

    $('.CodeMirror').height(getAutoHeight());
    $('#editor-publish').click(publishHandler.bind(editor));

    getModifyArticle.bind(editor)();
  });

  function editorOnHandler(cm, co) {
    $('.markdown-body').html(marked(cm.getValue()));
    $('.markdown-body pre code').each(function(i, block) {
      Prism.highlightElement(block);
    });
  }

  function getAutoHeight() {
    var $autoheight = $('div[autoheight]');
    var $editContainer = $('.edit-container');
    var $info = $editContainer.find('.info');
    var subtractHeight = $('.nav-wrapper').height() + $info.height() + parseInt($editContainer.css('margin-top').slice(0, -2)) + parseInt($info.css('margin-bottom').slice(0, -2)) + 10;

    return $(window).height() - subtractHeight;
  }

  function getModifyArticle() {
    var chipHtml;
    var editor = this;
    var postData = {
      _id: $('input[name=_id]').val(),
      _csrf: $('.edit-form input[name="_csrf"]').val()
    };

    if (postData._id) {
      $.post('/articles/getArticle', postData, function(article, status) {
        // add chips
        for (var i = 0; i < article.categories.length; ++i) {
          chipHtml = '<div class="chip">' + article.categories[i].name + '<i class="material-icons close">close</i></div>';
          $('.chips').prepend(chipHtml);
        }
        // add content
        editor.setValue(article.content);
      });
    }
  }

  function publishHandler() {
    var editor = this;
    var title = $('#edit-title').val();
    var content = editor.getValue();
    var intro = $('.edit-preview').text().slice(0, 150);
    var categories = $('.chips-placeholder').find('.chip').map(function() {
      return this.innerText.replace('close','').trim();
    }).toArray();
    var noEmptyAnduniqCategories = _.uniq(_.filter(categories, function(tag) { return tag !== ''; }));
    var _csrf = $('.edit-form input[name="_csrf"]').val();
    var _id = $('input[name=_id]').val();
    var postUrl;

    var postData = {
      title: title,
      categories: noEmptyAnduniqCategories.join('+-+'),
      content: content,
      intro: intro,
      _csrf: _csrf
    };

    if (_id) {
      postUrl = '/articles/modify/submit';
      postData._id = _id;
    } else {
      postUrl = '/articles/edit/addnew';
    }

    if (!title || !content || !intro) {
      Materialize.toast('Incomplete information', 3000);
    } else {
      $.post(postUrl, postData, function(response, status) {
        if (response.success) {
          window.location = '/articles';
        } else {
          Materialize.toast(response.data.err, 3000);
        }
      });
    }

    return false;
  }
})();
