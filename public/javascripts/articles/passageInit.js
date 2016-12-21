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
                $('.comment .comment-delete').click(commentRemoveHandler);
                $('.comment .reply-delete').click(replyRemoveHandler);
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
  function replyRemoveHandler() {
    $('.delete-type').val('reply');
    $('.delete-id').val($(this).parents('.reply').attr('id'));
    return true;
  }
  function commentRemoveHandler() {
    $('.delete-type').val('comment');
    $('.delete-id').val($(this).parents('.comment').attr('id'));
    return true;
  }
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

// delete
(function() {
  $(function() {
    $('#delete-modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: 0.5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
        starting_top: '4%', // Starting top style attribute
        ending_top: '25%', // Ending top style attribute
      }
    );
    $('.reply-delete').click(replyRemoveHandler);
    $('.comment-delete').click(commentRemoveHandler);
    $('.article-delete').click(articleRemoveHandler);
    $('.delete-agree').click(agreeHandler);
  });

  function replyRemoveHandler() {
    $('.delete-type').val('reply');
    $('.delete-id').val($(this).parents('.reply').attr('id'));
    return true;
  }

  function commentRemoveHandler() {
    $('.delete-type').val('comment');
    $('.delete-id').val($(this).parents('.comment').attr('id'));
    return true;
  }

  function articleRemoveHandler() {
    $('.delete-type').val('article');
    $('.delete-id').val($(this).parents('.article-header').attr('id'));
  }

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

  function agreeHandler() {
    var type =  $('.delete-type').val();
    var typeMap = {
      reply: '/comments/removereply',
      comment: '/comments/removecomment',
      article: '/articles/delete'
    };
    postUrl = typeMap[type];
    var postData = {
      _id: $('.delete-id').val(),
      _csrf: $('input[name="_csrf"]').val()
    };

    $.post(postUrl, postData, function(response, err) {
      if (!response.success) {
        Materialize.toast(response.err, 3000);
      } else {
        if (type === 'reply' || type === 'comment') {
          Materialize.toast('Delete Success', 3000);
          $.ajax({
            url: window.location.pathname,
            type: 'GET',
            success: function(html) {
              var reg = /(<div class="comments-wrap">.+<\/div>)<form id="new-comment-wrap"/;
              var new_comments = reg.exec(html);
              if (!!new_comments)
              $('.comments-wrap').replaceWith(new_comments[1]);
              else
              $('.comments-wrap').empty();

              $('.comment .comment-reply').click(replyHandler);
              $('.comment .comment-delete').click(commentRemoveHandler);
              $('.comment .reply-delete').click(replyRemoveHandler);
              $('.author-update .article-delete').click(articleRemoveHandler);
            }
          });
        } else {
          window.location.href = '/articles';
        }
      }
    });
  }
})();
