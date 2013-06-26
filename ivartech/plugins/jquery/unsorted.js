//unsorted.js - jQuery plugins not yet sorted
//
//@since: spring 2013.
//@author: ivartech <http://ivartech.com> - Nikola Stamatovic <nikola.stamatovic@ivar.rs> 

/*---------------------------------------------------
 ================== JQUERY PLUGINS ================== 
----------------------------------------------------*/

function htmlDecode(str) {
	return $('<div/>').html(str).text();
};

(function($) {
	$.fn.fileUpload = function(url, callback) {
		//TODO: if(!$(this).is('form')) {
		var iframe = $('<iframe id="uploadFrame" name="uploadFrame" width="0" height="0" border="0"></iframe>');
		$(this).parent().append(iframe);

	 	$(iframe).load(function() {
	 		var value = null;
	 		try {
	 			value = JSON.parse($(this).contents().find('body').html());
	 		} catch (e) {
	 			error(e);
	 		}
	 		callback(value);
		    setTimeout(function() {$(iframe).remove();}, 250);
	 	});

		$(this).attr({
			target: 'uploadFrame',
			action: url,
			method: 'post',
			enctype: 'multipart/form-data'
		});
		
		$(this).submit();
	};
}(jQuery));

(function($) {
	$.fn.classSwitch = function(to_be_switched, switch_with) {
		if ($(this).hasClass(to_be_switched)) {
			$(this).removeClass(to_be_switched).addClass(switch_with);
		}
	};
}(jQuery));

/*---------------------------------------------------
	Textarea line counting - jQuery plugin
---------------------------------------------------*/

(function($) {
	$.fn.lines = function() {
		var val = '';
		if (this.is('textarea')) {
			val = this.val();
		} else {
			val = this.html();
		}
		var span = $('<span style="position:absolute; left:-9999px; top: 0px; font-size:' + this.css('font-size') + '; width:' + this.width() + 'px; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word;">' + val + '</style>');
		$('body').append(span);
		var lines = $(span).height() / parseInt($(span).css('line-height'), 10);
		if (val.lastIndexOf('\n') == val.length - 1) {
			lines += 1;
		}
		$(span).remove();
		return lines;
	};
}(jQuery));

/*---------------------------------------------------
	Center element - jQuery plugin
---------------------------------------------------*/

(function($) {
	$.fn.center = function(parent, orientation) {
		if (parent == undefined)
			parent = this.parent();

		if (!isSet(orientation)||(orientation != 'horizontal')) {
			var h = parseInt(this.css('height'), 10);
			var ph = $(parent).height();
			var st = $(parent).scrollTop();
			this.css('top', (ph - h) / 2 + st);
		}
		
		if (!isSet(orientation)||(orientation != 'vertical')) {
			var w = parseInt(this.css('width'), 10);
			var pw = $(parent).width();
			var sl = $(parent).scrollLeft();
			this.css('left', (pw - w) / 2 + sl);
		}
		//this.offset({top: top, left: left});
	};

	$.fn.centerOnScreen = function(orientation) {
		this.center(window, orientation);
		var self = this;
		$(window).resize(function() {
			$(self).center(window, orientation);
		});
	};
}(jQuery));

(function($) {
	$.fn.isScrolled = function() {
		var viewportHeight = $(this).height();
		var children = $(this).children();
		var childrenHeight = 0;
		for (var i = 0; i < children.length; i++) {
			childrenHeight += $(children[i]).outerHeight(true);
		}
		if ($(this).height() < childrenHeight)
			return true;

		return false;
	};
}(jQuery));

(function($) {
	$.fn.scrollShadow = function(target) {
		if ((this[0].nodeName != '#document') && ($(this).css('position') == 'static'))
			$(this).css('position', 'relative');
		if (target == undefined)
			target = this;
		$(target).append('<div class="jq-list-shadow" style="position:absolute; width: 100%; display: none;"></div>');
		$(this).scroll(function(e) {
			var shadow = $(target).find('.jq-list-shadow');
			if ($(this).scrollTop() == 0) {
				$(shadow).fadeOut('fast');
				$(shadow).data('SHADOW_ACTIVE', false);
			} else {
				if (!$(shadow).data('SHADOW_ACTIVE')) {
					$('.jq-list-shadow').fadeIn('fast');
					$(shadow).data('SHADOW_ACTIVE', true);
				}
			}
		});
	};
}(jQuery));

(function($) {
	$.fn.outerHTML = function() {
		return $('<div />').append(this.eq(0).clone()).html();
	};
}(jQuery));

(function($) {
	$.fn.numbersOnly = function(fn, fnOther) {
		$(this).live('keydown', function(e){
			var value = $(this).val();
			var re = new RegExp('[^0-9]','gi');
			var match = value.match(re);
			if((match != null) && (match.length > 0)) {
				value = value.replace(re, '');
				$(this).val(value);
			}
			if (!(((e.which >= 48)&&(e.which <= 57))
				||((e.which >= 96)&&(e.which <= 105))
				||(e.which == 8)
				||(e.which == 37)
				||(e.which == 39)
				)) {
				e.preventDefault();
			} else {
				if (isSet(fn))
					fn(this, e.which);
			}
			if (isSet(fnOther))
				fnOther(this, e.which);
		});
	};
}(jQuery));
