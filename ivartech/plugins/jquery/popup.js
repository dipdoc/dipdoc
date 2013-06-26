//popup.js - Popup automation jQuery plugin
//
//@since: spring 2013.
//@author: ivartech <http://ivartech.com> - Nikola Stamatovic <nikola.stamatovic@ivar.rs> 

/*---------------------------------------------------
	POPUP - jQuery plugin
---------------------------------------------------*/

(function($) {
	$.fn.popup = function(speed, timeout) {
		var visible = $(this).data('visible');
		if (visible == undefined)
			$(this).data('visible', false);
		if (!$(this).data('visible')) {
			$(this).data('visible', true);
			$(this).fadeIn(speed);
			clearTimeout($(this).data('timer'));
			$(this).data('timer') == undefined;
			if (timeout != undefined) {
				var self = this;
				$(this).data('timer', setTimeout(function() {$(self).popup();}, timeout));
			}
		} else {
			$(this).data('visible', false);
			clearTimeout($(this).data('timer'));
			$(this).data('timer') == undefined;
			$(this).fadeOut(speed);
		}
	};
}(jQuery));

(function($) {
	$.fn.clearPopups = function() {
		for (var i = 0; i < this.length; i++) {
			var visible = $(this[i]).data('visible');
			if (visible) {
				$(this[i]).data('visible', false);
				clearTimeout($(this[i]).data('timer'));
				$(this[i]).data('timer') == undefined;
				$(this[i]).hide();
			}
		}
	};
}(jQuery));
