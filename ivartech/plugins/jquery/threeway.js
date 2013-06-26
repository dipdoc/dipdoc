//threeway.js - threeway switch
//
//@since: spring 2013.
//@author: ivartech <http://ivartech.com> - Nikola Stamatovic <nikola.stamatovic@ivar.rs> 

(function($) {
	$.fn.threeway = function(shadow, where) {
		if(!isSet(shadow))
			shadow = false;
			
		if(!isSet(where))
			where = 'center';
		
		var selector = this.selector;
		
//		if($('head style[title="iw-threeway"]').length == 0) {
//			var style = $('<style type="text/css" title="iw-threeway">.iw-threeway-container  position: relative; width: inherit; height: inherit; } .iw-threeway-container div { position: absolute; width: inherit; height: inherit; top: 0px; left: 0px; text-align: center;} .iw-threeway-fields i {cursor: pointer;} .iw-threeway-container i {position: absolute;} .iw-threeway-container i.iw-threeway-left {display: inline-block; left: 0px;} .iw-threeway-container i.iw-threeway-right {display: inline-block; right: 0px;} .iw-threeway-container i.iw-threeway-center { display: inline-block; position: relative; } .iw-threeway-shadow-pin i {display: none;}</style>');
//			$('head').append(style);
//		}
		var inner = $('<div class="iw-threeway-container"><div class="iw-threeway-pin"><i></i></div><div class="iw-threeway-fields"><i class="iw-threeway-left"></i><i class="iw-threeway-center"></i><i class="iw-threeway-right"></i></div></div>');
		
		if(shadow)
			$(inner).prepend('<div class="iw-threeway-shadow-pin"><i></i></div>');
		
		this.append(inner);
		
		function shadowPinShow(elem, where) {
			var root = $(elem).parents(selector).first();
			var shadowPin = $(root).find('.iw-threeway-shadow-pin i');
			$(shadowPin).addClass('iw-threeway-'+where);
		};

		function shadowPinHide(elem, where) {
			var root = $(elem).parents(selector).first();
			var shadowPin = $(root).find('.iw-threeway-shadow-pin i');
			$(shadowPin).removeClass('iw-threeway-'+where);
		};

		function pinPlace(elem, where) {
			var root = $(elem).parents(selector).first();
			var pin = $(root).find('.iw-threeway-pin i');
			$(pin).attr('class', 'iw-threeway-'+where);
			var value = 0;
			switch (where) {
				case 'left':
					value = 1;
					break;
				case 'right':
					value = -1;
					break;
			}
			$(root).attr('value', value);
			$(root).find('.iw-threeway-container').attr('class', 'iw-threeway-container iw-threeway-value-'+where);
		};
		
		pinPlace(this.find('.iw-threeway-container'), where);
		
		if(shadow) {
			$(inner).find('.iw-threeway-fields .iw-threeway-left').hover(function(){
				shadowPinShow(this, 'left');
			},function(){
				shadowPinHide(this, 'left');
			});
	
			$(inner).find('.iw-threeway-fields .iw-threeway-right').hover(function(){
				shadowPinShow(this, 'right');
			},function(){
				shadowPinHide(this, 'right');
			});
	
			$(inner).find('.iw-threeway-fields .iw-threeway-center').hover(function(){
				shadowPinShow(this, 'center');
			},function(){
				shadowPinHide(this, 'center');
			});
		}
	
		$(inner).find('.iw-threeway-fields .iw-threeway-left').click(function(){
			pinPlace(this, 'left');
		});
	
		$(inner).find('.iw-threeway-fields .iw-threeway-right').click(function(){
			pinPlace(this, 'right');
		});
	
		$(inner).find('.iw-threeway-fields .iw-threeway-center').click(function(){
			pinPlace(this, 'center');
		});
	};
}(jQuery));
