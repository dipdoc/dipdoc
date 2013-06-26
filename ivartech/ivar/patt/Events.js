/**
 *	@file		IVARTECH Events Class | Mediator pattern
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130313  
 *	
 *	@namespace	ivar.patt
 */

ivar.namespace('ivar.patt');

/**
 *	@class
 *	@classdesc	Events class enables you to stack functions under a single name to be executed when that name is called from anywhere in the program. Functions can be passed arguments when firing an event.
 *
 *	@constructor
 *	@property	{object}	list		Contains the event names paired with arrays of functions
 *	@property	{array}		event_names	Contains all the event names
 */
ivar.patt.Events = function Events(obj) {
	this.list = {};
	this.event_names = [];
	this.multi = {
		names: {},
		states: {},
		separator: ','
	};
	
	this.any;
	
	if(ivar.isSet(obj))
		ivar.extend(obj, this);
};

ivar.patt.Events.prototype.constructor = ivar.patt.Events;

/**
 *	Binds a single function or an array of functions to an event name
 
 	var me = new ivar.patt.Events();
	me.bind(['foo','bar','baz'], function(){
		print('foo%bar%baz');
	});
	
	me.bind(['foo','baz'], function(){
		print('foo%baz');
	});
	
	me.bind(['baz','bar'], function(){
		print('baz%bar');
	});
	
	ivar.print(me);
	me.fire('foo');
	me.unbind(['bar','baz']);
	me.fire('baz');
	me.fire('bar');
	
 *	
 *	@param	{string|number}						event_name
 *	@param 	{function|array[function,...]}		func(...)
 */
ivar.patt.Events.prototype.bind = function(event_name, func) {
	if(event_name === 'any') {
		this.any = func;
		return;
	}
	
	if(ivar.isArray(event_name)) {
		var multi_event_name = this.multi_nameGen(event_name);
		this.multi_bind(event_name, multi_event_name);
		event_name = multi_event_name;
	}

	if(!ivar.isArray(func))
		func = [func];
	for (var i = 0; i < func.length; i++) {
		if (!this.list.hasOwnProperty(event_name)) {
			this.list[event_name] = new Array();
			this.list[event_name].push(func[i]);
			this.event_names.push(event_name);
		} else {
			this.list[event_name].push(func[i]);
		}
	}
};

/**
 *	Removes a certain function or array of functions from an event, thus disabling them to be fired
 *
 *	@param	{string|number}						event_name
 *	@param 	{function|array[function,...]}		func(...)
 */
ivar.patt.Events.prototype.unbind = function(event_name, func) {
	if(event_name === 'any') {
		this.any = undefined;
		return;
	}
	
	if(ivar.isArray(event_name)) {
		var multi_event_name = this.multi_nameGen(event_name);
		this.multi_unbind(event_name, multi_event_name);
		event_name = multi_event_name;
	}
	
	var arr = this.list[event_name];
	if(!ivar.isArray(func))
		func = [func];
	if (ivar.isSet(arr) && ivar.isFunction(func)) {
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < func.length; j++) {
				if (arr[i] === func[j]) {
					this.list[event_name].remove(i);
				}
			}
		}
	}
	if (ivar.isSet(arr) && (arr.length == 0))
		this.clearBound(event_name);
};

ivar.patt.Events.prototype.multi_nameGen = function(arr) {
	return arr.sort().join(this.multi.separator);
};

ivar.patt.Events.prototype.multi_stateReset = function(multi_event_name) {
	if(this.multi.states.hasOwnProperty(multi_event_name)) {
		for(var j in this.multi.states[multi_event_name]) {
			this.multi.states[multi_event_name][j] = false;
		}
	}
};

ivar.patt.Events.prototype.multi_singleEventFied = function(event_name) {
	if(this.multi.names.hasOwnProperty(event_name)) {
		for(var i = 0; i < this.multi.names[event_name].length; i++) {
			var multi_event_name = this.multi.names[event_name][i];
			if(this.multi.states.hasOwnProperty(multi_event_name)) {
				var multi_event_state = this.multi.states[multi_event_name];
				var fire = true;
				if(multi_event_state.hasOwnProperty(event_name))
					multi_event_state[event_name] = true
				for(var j in multi_event_state) {
					if(multi_event_state[j] == false) {
						fire = false;
						break;
					}
				}	
			}
			if(fire)
				this.fire(this.multi.names[event_name][i].split(this.multi.separator));	
		}
	}
};

ivar.patt.Events.prototype.multi_bind = function(arr, multi_event_name) {
	for(var i = 0; i < arr.length; i++) {
		if(!this.multi.states.hasOwnProperty(multi_event_name)) 
			this.multi.states[multi_event_name] = {};
		this.multi.states[multi_event_name][arr[i]] = false;
		
		if(!this.multi.names.hasOwnProperty(arr[i]))
			this.multi.names[arr[i]] = [];
		this.multi.names[arr[i]].push(multi_event_name);
	}
		
}

ivar.patt.Events.prototype.multi_unbind = function(arr, multi_event_name) {
		if(this.multi.states.hasOwnProperty(multi_event_name)) 
			delete this.multi.states[multi_event_name];
			
		for(var i = 0; i < arr.length; i++) {
			if(this.multi.names.hasOwnProperty(arr[i]))
				this.multi.names[arr[i]].remove(this.multi.names[arr[i]].find(multi_event_name));
			if(this.multi.names[arr[i]].length == 0)
				delete	this.multi.names[arr[i]];
		}
}


/**
 *	Executes all of the functions stored under given event name. Except mandatory event name parameter it can be passed infinite number of parameters that will be passed to functions.
 *
 *	@param	{string|number}	event_name
 */
ivar.patt.Events.prototype.fire = function(event_name) {
	if(ivar.isArray(event_name)) {
		event_name = this.multi_nameGen(event_name);
		this.multi_stateReset(event_name);
	}
	
	var arr = this.list[event_name];
	var args = [];
		
	ivar.eachArg(arguments, function(i, elem) {
		args.push(elem);
	});

	if(ivar.isSet(this.any) && ivar.isFunction(this.any))
		this.any.apply(null, args);
	args.remove(0);
	var arrayOfEventNames = [];
	if (ivar.isSet(arr))
		arr.each(function(i, obj) {
			if (ivar.isSet(obj)) {
				if (ivar.isFunction(obj))
					obj.apply(null, args);
				else if (ivar.isString(obj))
					arrayOfEventNames.push(obj);
			} 
		});
	
	if (!ivar.isArray(event_name))
		this.multi_singleEventFied(event_name);
		
	if (arrayOfEventNames.length > 0)
		this.fireMultipleEvents(arrayOfEventNames);
};

ivar.patt.Events.prototype.fireMultipleEvents = function(arrayOfEventNames) {
	for (var i = 0; i < arrayOfEventNames.length; i++)
		this.fire(arrayOfEventNames[i]);
};

/**
 *	Returns an array of all of the names of events that can be fired
 *	
 *	@param	{string|number}	event_name
 */
ivar.patt.Events.prototype.getBound = function(event_name) {
	return this.list[event_name];
};

/**
 *	Removes an event by given event name with all bound functions
 *
 *	@param	{string|number}	event_name
 */
ivar.patt.Events.prototype.clearBound = function(event_name) {
	delete this.list[event_name];
	for(var i = 0; i < this.event_names.length; i++) {
		if (this.event_names[i] === event_name) {
			this.event_names.remove(i);
			break;
		}
	}
};

/**
 *	Removes all entries and restores the object to null state
 */
ivar.patt.Events.prototype.clear = function() {
	this.list = {};
	this.event_names = [];
	this.multi.names = {};
	this.multi.states = {};
};

/**
 *	Returns length|size, that is number of events
 *
 *	@return 	{number}	
 */
ivar.patt.Events.prototype.size = function() {
	return this.event_names.length();
};

if(!ivar.hasOwnProperty('Events'))
	ivar.Events = ivar.patt.Events;
