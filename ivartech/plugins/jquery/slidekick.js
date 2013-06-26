
/*
	=== Slidekick v0.7 ===
	description: Extremely flexible carousel in a form of a jQuery plugin
	author: Nikola Stamatovic Stamat http://stamat.info
	company: http://ivar.rs
	since: 11.02.2012.

*/


$.fn.slidekick = function(options) {
	var slidekicks = new Array();
	if(options == undefined) 
			var options = {};
	this.each(function() {
		options.container = this;
		slidekicks.push(new Slidekick(options));
	});
	return slidekicks;
};


function Slidekick(obj) {

	this.anim_active = false;	
	this.current_page = 1;
	
	//default values
	this.container = null;
	this.viewport = null;
	this.content = null;
	this.pagination = null;
	this.left = null;
	this.right = null;
	
	this.container_class = '';
	this.viewport_class = '.slidekick-viewport';
	this.content_class = '.slidekick-content';
	this.pagination_class = '.slidekick-pagination';
	this.left_class='.slidekick-left';
	this.right_class='.slidekick-right';
	
	this.speed = 'normal';
	this.rows = 1;
	this.cols = 1;
	this.vertical = false;
	this.loop = false;
	this.pag_content = '';
	this.pag_enum = false;
	this.packslides = true;
	this.slide_package = 'ul';
	this.slideclass = 'slide';
	this.tidy = false; //presume you do not keep things tidy!
	
	this.timer = null;
	this.last_time = 0;
	this.pause_time = 0;
	this.pause_timer = null;
	this.time = 8000;
	this.direction = 'l2r';
	this.pause_on_hover = false;
	this.autoplay_enabled = false;
	this.recalc_pag_dimensions = true;
	
	this.onPause = function(){};
	this.onResume = function(){};
	this.onNext = function(){};
	this.onPrevous = function(){};
	
	//load values from JSON
	
	if(obj.tidy != undefined)
		this.tidy = obj.tidy;
	
	if(obj.container != undefined) {
		if(typeof obj.container == 'object') {
			this.container = obj.container;
		} else if(typeof obj.container == 'string') {
			this.container = $(obj.container);
			if(this.container.length > 1) {
				this.container = this.container[0];
			}
		}
	}
	this.container_class =  this.container.className;
	
	if(obj.viewport != undefined) {
		this.viewport_class = obj.viewport;
		if(this.tidy)
			this.viewport = $(this.container).find(this.viewport_class);
		else
			this.viewport = $(this.viewport_class);
	} else {
		var test = $(this.container).find(this.viewport_class);
		if(test.length == 0) {
			if((obj.pagination == undefined)&&($(this.container).find(this.pagination_class).length==0)) {
				var html = $(this.container).html();
				$(this.container).html('<div class="'+this.viewport_class.substring(1,this.viewport_class.length)+'">'+html+'</div>');
				this.viewport =  $(this.container).find(this.viewport_class);
				$(this.container).append('<div class="'+this.pagination_class.substring(1,this.pagination_class.length)+'"></div>');
			} else {
				this.viewport =  this.container;
				this.viewport_class =  this.container.className;
			}
		} else {
			this.viewport = test;
		}
	}
	
	if(obj.content != undefined) {
		this.content_class = obj.content;
		if(this.tidy)
			this.content = $(this.container).find(this.content_class);
		else
			this.content = $(this.content_class);
	} else {
		var test = $(this.container).find(this.content_class);
		if(test.length == 0) {
			var html = $(this.viewport).html();
			$(this.viewport).html('<div class="'+this.content_class.substring(1,this.content_class.length)+'">'+html+'</div>');
			this.content =  $(this.viewport).find(this.content_class);
		} else {
			this.content = test;
		}
	}
	
	if(obj.pagination != undefined) {
		this.pagination_class = obj.pagination;
		if(this.tidy)
			this.pagination = $(this.container).find(this.pagination_class);
		else
			this.pagination = $(this.pagination_class);
	} else {
		var test = $(this.container).find(this.pagination_class);
		if(test.length == 0)
			this.pagination =  undefined;
		else
			this.pagination = test;
	}
	
	if(obj.left != undefined) {
		this.left_class = obj.left;
		if(this.tidy)
			this.left = $(this.container).find(this.left_class);
		else
			this.left = $(this.left_class);
	} else {
		var test = $(this.container).find(this.left_class);
		if(test.length == 0)
			this.left =  undefined;
		else
			this.left = test;
	}
	
	if(obj.right != undefined) {
		this.right_class = obj.right;
		if(this.tidy)
			this.right = $(this.container).find(this.right_class);
		else
			this.right = $(this.right_class);
	} else {
		var test = $(this.container).find(this.right_class);
		if(test.length == 0)
			this.right =  undefined;
		else
			this.right = test;
	}
	
	if(obj.speed != undefined)
		this.speed = obj.speed;
	if(obj.rows != undefined)
		this.rows = obj.rows;
	if(obj.cols != undefined)
		this.cols = obj.cols;
	if(obj.vertical != undefined)
		this.vertical = obj.vertical;
	if(obj.pag_content != undefined)
		this.pag_content = obj.pag_content;
	if(obj.pag_enum != undefined)
		this.pag_enum = obj.pag_enum;
	if(obj.packslides != undefined)
		this.packslides = obj.packslides;
	if(obj.slide_package != undefined)
		this.slide_package = obj.slide_package;
	if((obj.rows==1)&&(obj.cols==1))
		this.packslides = false;
	if(obj.loop != undefined) {
		this.loop = obj.loop;
		if((this.loop)&&!((obj.rows==1)&&(obj.cols==1)))
			this.packslides = true;
	}
	if(obj.slideclass != undefined)
		this.slideclass = obj.slideclass;
	if(obj.autoplay != undefined) {
		if(typeof obj.autoplay == 'number')
			this.time = obj.autoplay;
		this.autoplay_enabled = true;
	}
	if(obj.direction != undefined)
		this.direction = obj.direction;
	if(obj.pause_on_hover != undefined)
		this.pause_on_hover = obj.pause_on_hover;
	if(obj.center_pagination != undefined)
		this.center_pagination = obj.center_pagination;
		
	if(obj.center_pagination != undefined)
		this.center_pagination = obj.center_pagination;
	if(obj.center_pagination != undefined)
		this.center_pagination = obj.center_pagination;
	if(obj.center_pagination != undefined)
		this.center_pagination = obj.center_pagination;
	if((obj.onPause != undefined)&&(typeof obj.onPause == 'function'))
			this.onPause = obj.onPause;
	if((obj.onResume != undefined)&&(typeof obj.onResume == 'function'))
			this.onResume = obj.onResume;
	if((obj.onNext != undefined)&&(typeof obj.onNext == 'function'))
			this.onNext = obj.onNext;
	if((obj.onPrevous != undefined)&&(typeof obj.onPrevous == 'function'))
			this.onPrevous = obj.onPrevous;
	
	//calculate additional values		
	this.items = $(this.content).children();
	this.single_w = $(this.items[0]).outerWidth(true);
	this.single_h = $(this.items[0]).outerHeight(true); 
	this.viewport_w = this.cols * this.single_w;
	this.viewport_h = this.rows * this.single_h;
	this.items_per_page = this.cols * this.rows;
	
	this.pages = Math.ceil(this.items.length/(this.items_per_page));
	
	//initialize
	this.initCarousel();
	if(this.packslides) 
		this.packSlides();
	if(this.pagination != undefined)
		this.initPagination();
	if(this.autoplay_enabled)
		this.play();
	
	//bind left, right controls
	var self = this;
	$(this.left).click(function(){
		self.reset();
		self.prevous();
	});
	
	$(this.right).click(function(){
		self.reset();
		self.next();
	});
	
	$(this.viewport).hover(
		function(){
			self.pause();
		},
		function(){
			self.resume();
	});
}

Slidekick.prototype.prevous = function() {
	var limit = 1;
	if(this.loop)
		limit = 0;
	if(this.current_page > limit) {
		this.turnPage(this.current_page-1);
	} else if((!this.loop)&&(this.current_page == limit)) {
		this.turnPage(this.pages);
	}
	
	if(this.onPrevous != undefined)
			this.onPrevous();
}

Slidekick.prototype.next = function() {
	var limit = this.pages;
	if(this.loop)
		limit = this.pages+1;
	if(this.current_page < limit) {
		this.turnPage(this.current_page+1);
	} else if((!this.loop)&&(this.current_page == limit)) {
		this.turnPage(1);
	}
	
	if(this.onNext != undefined)
			this.onNext();
}

Slidekick.prototype.autoplay = function(action, time, direction) {
	var self = this;
	if(this.last_time == 0)
		this.last_time = new Date().getTime();
	if(time != undefined)
		this.time = time;
	if(direction != undefined)
		if((this.direction =='l2r')||(this.direction =='r2l'))
			this.direction = direction;
	if(action == 'start') {
		this.timer = setInterval(function(){
		if(self.direction =='l2r')
			self.next();
		else if(self.direction =='r2l')
			self.prevous();
		self.last_time = new Date().getTime();
		}, this.time);
	} else if (action == 'stop') {
		clearInterval(this.timer);
		this.timer = null;
	}
}

Slidekick.prototype.play = function() {
	if(this.autoplay_enabled)
		this.autoplay('start');
}

Slidekick.prototype.stop = function() {
	if(this.autoplay_enabled)
		this.autoplay('stop');
}

Slidekick.prototype.reset = function() {
	this.stop();
	this.play();
}

Slidekick.prototype.pause = function() {
	if(this.autoplay_enabled) {
		if(this.pause_timer != null)
			clearTimeout(this.pause_timer);
		this.pause_time = new Date().getTime();
		this.stop();
		if(this.onPause != undefined)
			this.onPause();
	}
}

Slidekick.prototype.resume = function() {
	if(this.pause_time != 0) {
		var self = this;
		this.pause_timer = setTimeout(function(){
			if(self.direction =='l2r')
				self.next();
			else if(self.direction =='r2l')
				self.prevous();
			self.last_time = new Date().getTime();
			self.play();
			clearTimeout(self.pause_timer);
			self.pause_timer = null;
		}, this.pause_time - this.last_time);
		this.pause_time = 0;
		
		if(this.onResume != undefined)
			this.onResume();
	}
}


/*VIEWPORT and CONTENT INIT*/
Slidekick.prototype.initCarousel = function() {
	$(this.viewport).css('overflow', 'hidden').css('position', 'relative').width(this.viewport_w).height(this.viewport_h);
	$(this.content).css('position', 'absolute');
	
	var mod = 0;
	if(this.loop)
		mod = 2;
		
	if(this.vertical) {
		$(this.content).width(this.viewport_w);
		$(this.content).height((this.pages+mod)*this.viewport_h);
	} else {
		$(this.content).width((this.pages+mod)*this.viewport_w);
		$(this.content).height(this.viewport_h);
	}
}

/*PACK SLIDES*/
Slidekick.prototype.packSlides = function() {
	var pagecount = 0;
	for(var i = 0; i < this.items.length; i++) {
		if(i%this.items_per_page == 0) {
			pagecount +=1;
			$(this.content).append('<'+this.slide_package+' class="'+this.slideclass+' '+this.slideclass+'-'+pagecount+' clearfix"></'+this.slide_package+'>');
		}
		
		$(this.items[i]).detach();
		$(this.content).find('.'+this.slideclass+'-'+pagecount).append(this.items[i]);
	}
	
	if(this.loop) {
		//clone last slide
		$(this.content).prepend('<'+this.slide_package+' class="'+this.slideclass+' '+this.slideclass+'-'+0+' clone clearfix">'+$(this.content).find('.'+this.slideclass+'-'+this.pages).html()+'</'+this.slide_package+'>');
		
		//clone first slide
		$(this.content).append('<'+this.slide_package+' class="'+this.slideclass+' '+this.slideclass+'-'+(this.pages+1)+' clone clearfix">'+$(this.content).find('.'+this.slideclass+'-'+1).html()+'</'+this.slide_package+'>');
	}
	
	$(this.viewport).find('.'+this.slideclass).width(this.viewport_w).height(this.viewport_h).css('float', 'left');
	
	if(this.loop)
		this.turnPage(1, true);
	
}

/*INIT PAGINATION*/
Slidekick.prototype.initPagination = function() {
	var html = '';
	for(var i = 0; i < this.pages; i++) {
		var num = '';
		if(this.pag_enum)
			num = i+1;
		html += '<li id="pag-'+(i+1)+'" class="pag">'+this.pag_content+num+'</li>'
	}
	
	$(this.pagination).append('<ul class="slidekick-pag-holder clearfix">'+html+'</ul>');
	
	var pag_elem = $(this.pagination).find('.pag').first();
	var pag_holder = $(this.pagination).find('.slidekick-pag-holder');

	if(this.recalc_pag_dimensions)
		if($(pag_elem).css('float') !='none') {
			var pag_width = $(pag_elem).outerWidth(true);
			$(pag_holder).width(pag_width*this.pages);
			var pag_height = $(pag_elem).outerHeight(true);
			$(pag_holder).height(pag_height);
		}
	
	var self = this;
	$(this.pagination).find('li').click(function(){
		var page_class = $(this).attr('id');
		var page = parseInt(page_class.split('-')[1]);
		self.turnPage(page);
	}).first().addClass('active');
}

Slidekick.prototype.turnPage = function(page, skip) {
	if(skip == undefined)
		skip = false;
	if(!this.anim_active) {
		this.anim_active = true;
		
		$(this.pagination).find('.active').removeClass('active');
		$(this.pagination).find('#pag-'+page).addClass('active');
		
		this.current_page = page;
		
		if(!this.loop)
			page -=1;
		
		var viewport_size = 0;
		var offset = 0;
		var start_offset = 0;
	
		if(this.vertical) {
			viewport_size = this.viewport_h;
			offset = $(this.content).offset().top;
			start_offset = $(this.viewport).offset().top;
		} else {
			viewport_size = this.viewport_w;
			offset = $(this.content).offset().left;
			start_offset = $(this.viewport).offset().left;
		}

		var diff = (start_offset-offset)-(page*viewport_size);
	
		var sign = '+';
		if(diff < 0)
			sign = '-';
	
		var self = this;
		
		if(!skip) {
			if(this.vertical)
				$(this.content).animate({'top': ''+sign+'='+Math.abs(diff)+'px'}, this.speed, function(){self.anim_active = false;
				if(self.loop)
					if(page > self.pages) {
						$(self.pagination).find('.active').removeClass('active');
						$(self.pagination).find('#pag-'+1).addClass('active');
						$(self.content).offset({'top': start_offset-viewport_size});
						self.current_page = 1;
					} else if(page == 0){
						$(self.pagination).find('.active').removeClass('active');
						$(self.pagination).find('#pag-'+self.pages).addClass('active');
						$(self.content).offset({'top': start_offset-self.pages*viewport_size});
						self.current_page = self.pages;
					}
				});
			else
				$(this.content).animate({'left': ''+sign+'='+Math.abs(diff)+'px'}, this.speed, function(){self.anim_active = false;
				if(self.loop)
					if(page > self.pages) {
						$(self.pagination).find('.active').removeClass('active');
						$(self.pagination).find('#pag-'+1).addClass('active');
						$(self.content).offset({'left': start_offset-viewport_size});
						self.current_page = 1;
					} else if(page == 0){
						$(self.pagination).find('.active').removeClass('active');
						$(self.pagination).find('#pag-'+self.pages).addClass('active');
						$(self.content).offset({'left': start_offset-self.pages*viewport_size});
						self.current_page = self.pages;
					}
				
				});
		} else {
			if(this.vertical) {
				$(this.content).offset({'top': offset+diff});
				this.anim_active = false;
			} else {
				$(this.content).offset({'left': offset+diff});
				this.anim_active = false;
			}
		}
	}
}

