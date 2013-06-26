//number-selector.js - Number selector widget jQuery plugin
//
//@since: spring 2013.
//@author: ivartech <http://ivartech.com> - Nikola Stamatovic <nikola.stamatovic@ivar.rs> 

(function($) {
	$.fn.NumberSelector = function(min, max, onchange) {
		var template = $('<div class="iw ivar-widget iwns"><div class="iwns-controls"><div class="iwns-up iwns-btn"><i class="i10"></i></div><div class="iwns-down iwns-btn"><i class="i10"></i></div></div></div>');
		
		for (var i = 0; i < this.length; i++) {
			var tmp = $(template).clone();
			$(tmp).prepend($(this[i]).clone());
			$(tmp).find('input[type="text"]').addClass('iwns-field');
			$(this[i]).replaceWith(tmp);
		}
		
		$('.iwns-field').live('mouseup',function(){
			this.select();
		});
	
		$('.iwns-field').live('keydown', function(e){
			if (!(((e.which >= 48)&&(e.which <= 57))
				||((e.which >= 96)&&(e.which <= 105))
				||(e.which == 8)
				||(e.which == 37)
				||(e.which == 39)
				)) {
					e.preventDefault();
			} else {
				if ((e.which != 37)||(e.which!= 39)) {
					var self = this;
					var t = setTimeout(function(){
						var value = $(self).val();
						var re = new RegExp('[^0-9]','gi');
						var match = value.match(re);
						if((match != null) && (match.length > 0)) {
							value = value.replace(re, '');
							$(self).val(value);
						}
						value = parseInt(value, 10);

						if(isNaN(value)) {
							value = min;
							$(self).val(min);
						} else if(value > max) {
							value = max;
							$(self).val(max);
						} else if (value < min) {
							value = min;
							$(self).val(min);
						}
						if(isSet(onchange))
							onchange(self, value);
					}, 100);
				}
			}
			if (e.which == 13) {
				$(this).blur();
			} else if (e.which == 38) {
				$(this).parents('.iwns').find('.iwns-up').click();
			} else if (e.which == 40) {
				$(this).parents('.iwns').find('.iwns-down').click();
			}
		});
	
	
		$('.iwns-up').live('click', function(e) {
			var field = $(this).parents('.iwns').find('.iwns-field');
			var value = parseInt($(field).val(), 10);
			if(value < max) {
				value = value+1;
				$(field).val(value);
				if(isSet(onchange))
					onchange(this, value);
			}
		});
	
		$('.iwns-down').live('click', function(e) {
			var field = $(this).parents('.iwns').find('.iwns-field');
			var value = parseInt($(field).val(), 10);
			if(value > min) {
				value = value-1;
				$(field).val(value);
				if(isSet(onchange))
					onchange(this, value);
			}
		});
	};
}(jQuery));
