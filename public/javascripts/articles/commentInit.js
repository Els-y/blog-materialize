(function() {
  $(function() {
    var editor = CodeMirror.fromTextArea($('.new-comment').get(0), {
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      lineWrapping: true,  // 长句子折行
      theme: "default",
      keyMap: 'sublime',
      extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
    });

    function commentHandler() {
      var _csrf = $('input[name="_csrf"]').val();
      var content = editor.getValue();
      var postData;

      if ($('.comment-form .chip').length === 0) {
        postData = {
          content: content,
          reply: false,
          _csrf: _csrf
        };
      } else {
        postData = {
          content: content,
          reply: true,
          commentId: $('.comment-form input:hidden').val(),
          _csrf: _csrf
        };
      }

      if (content.trim() === '') {
        Materialize.toast("Comment empty", 3000);
      } else {
        $.post('/comments/newcomment', postData, function(response, status) {
          if (!response.success) {
            Materialize.toast(response.err, 3000);
          } else {
            editor.setValue('');
            Materialize.toast('Comment Success', 3000);
            $('.comment-form .chip .close').click();
            $.ajax({
            	url: window.location.pathname,
            	type: 'GET',
            	success: function(html) {
                var reg = /(<div class="comments-wrap">.+<\/div>)<form id="new-comment-wrap"/;
                var new_comments = reg.exec(html);
                $('.comments-wrap').replaceWith(new_comments[1]);
                $('.comment .comment-reply').click(replyHandler);
            	}
            });
          }
        });
      }

      return false;
    }

    $('.article-comments .btn').click(commentHandler);
    $('.comment .comment-reply').click(replyHandler);
  });

  function replyHandler() {
    var $comment = $(this).parents('.comment');
    var id = $comment.attr('id');
    var author = $comment.find('.comment-author').text();
    var $chip = $('.comment-form .chip');
    var closeHtml = '<i class="close material-icons">close</i>';
    var chipHtml = '<div class="chip">Reply to ' + author + closeHtml + '</div>';

    if ($chip.length !== 0) {
      $chip.html('Reply to ' + author + closeHtml);
    } else {
      $('.comment-form').prepend(chipHtml);
    }

    $('.comment-form input:hidden').val(id);

    return true;
  }
})();
