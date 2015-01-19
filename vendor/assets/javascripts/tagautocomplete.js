 String.prototype.width = function(font) {
  var f = font || '12px arial',
      o = $('<div>' + this + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();
  return w;
}

function getInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

function setCursorPosition(node, pos) {
  var node = (typeof node == "string" || node instanceof String) ? document.getElementById(node) : node;

  if(!node){
    return false;
  } else if (node.createTextRange) {
    var textRange = node.createTextRange();
    textRange.collapse(true);
    textRange.moveEnd(pos);
    textRange.moveStart(pos);
    textRange.select();
    return true;
  } else if (node.setSelectionRange) {
    node.setSelectionRange(pos,pos);
    return true;
  }
  return false;
}

!function ($) {

  "use strict"; // jshint ;_;

  var Tagautocomplete = function (element, options) {
    $.fn.typeahead.Constructor.call(this, element, options)
    this.after = this.options.after || this.after
    this.show = this.options.show || this.show
  }

  Tagautocomplete.prototype = $.extend({}, $.fn.typeahead.Constructor.prototype, {

    constructor: Tagautocomplete

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value').replace(/(<\/?em>)/g, '');

      var cursor = getInputSelection(this.$element[0]).start;
      var input = $(this.$element[0]);
      var before = cursor;
      while (before > 0 && input.val()[before - 1] != ':') {
        --before;
      }
      input.val(this.query.substring(0, before) + val.substring() + this.query.substring(cursor));

      this.$element.change();

      this.after();

      setCursorPosition(this.$element[0], input.val().length);

      return this.hide()
    }

  , after: function () {

  }

  , show: function () {

      var pos = this.$element.position();
      var height = this.$element[0].offsetHeight;

      var left = pos.left + this.$element.val().width(this.$element.css('font-size') + ' ' + this.$element.css('font-family'));
      if (left > pos.left + this.$element.width()) {
        left = pos.left;
      }

      this.$menu
        .insertAfter(this.$element)
        .show()
        .css({
          position: "absolute",
          top: pos.top + height + "px",
          left: left + "px"
        });

      this.shown = true
      return this
  }

  , extractor: function () {
      var query = this.query;
      var position = getInputSelection(this.$element[0]).start;
      query = query.substring(0, position);
      var regex = new RegExp("(^|\\s)(" + this.options.character + "[\\w-]*)$");
      var result = regex.exec(query);
      if(result && result[2])
        return result[2].trim().toLowerCase();
      return '';
    }

  , updater: function(item) {
      return item+' ';
  }

  , matcher: function (item) {
      return true;
    }

  ,  highlighter: function (item) {     
      return item;
    }

  })


  var old = $.fn.tagautocomplete

  $.fn.tagautocomplete = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tagautocomplete')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tagautocomplete', (data = new Tagautocomplete(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tagautocomplete.Constructor = Tagautocomplete

  $.fn.tagautocomplete.defaults = $.extend($.fn.typeahead.defaults, {
    character: '@'
  })


  $.fn.tagautocomplete.noConflict = function () {
    $.fn.tagautocomplete = old
    return this
  }

}(window.jQuery);
