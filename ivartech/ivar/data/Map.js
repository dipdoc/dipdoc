/**
 *	Map data structure class
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130313  
 *	@file
 *
 *	@namespace	ivar.data
 */


ivar.namespace('ivar.data');

/**
 *	Map class similar to Java Map, providing methods for efficient usage of traditional key-value hash table storage
 *	@class 	asf		s
 *	@constructor
 *	@property	{number}	length	Length of the map, like array length. Even though keys.length would do fine, this is kept for elegance
 *	@property	{object}	object	Object that contains key-value pairs
 *	@property	{array}		keys	Array containing key names used as keys in object to enable getFirst and getLast functionality
 */
ivar.data.Map = function Map(o) {
	this.length = 0;
	var object = {};
	var keys = [];
	var pointer = 0;
	
	this.incorporate = function(obj) {
		var new_keys = [];
		for(var i in obj) {
			if(!this.hasKey(i))
				new_keys.push(i);
			object[i] = obj[i];
		}
		for(var i = 0; i < new_keys.length; i++) {
			keys.push(new_keys[i]);
		}
		this.length = keys.length;
	};
	
	/**
	 *	Stores key and value to map object
	 *
	 *	@this	{Map}
	 *	@param	{string|number}	key		A value that represents key for value retrieval
	 *	@param	{any}			value 	A value marked with the correspondent key
	 *	@return	{string|number}			Returns the key value		
	 */
	this.put = function(key, value) {
		var o = {};
		o[key] = value;
		this.incorporate(o);
		return key;
	};
	
	/**
	*	Clones another map's values to this map
	*
	*	@this	{Map}
	*	@param	{Map}	map		Map to which values should be cloned
	*/
	this.putAll = function(map) {
		this.length = map.length;
		object = map.entrySet();
		keys = map.keys();
	};

	/**
	 *	Removes the map entry by given key
	 *
	 *	@this	{Map}
	 *	@param	{string|number}	key		Name of the key under which a value is stored
	 *	@return	{any}					Returns the value of removed entry
	 */
	this.remove = function(k) {
		if(ivar.whatis(k) !== 'array')
			k = [k];
		for(var i = 0; i < k.length; i++) {
			this._remove(k[i]);
		}
	}
	 
	this._remove = function(key) {
		if(this.hasKey(key)) {
			this._removeKeyFromArray(key);
		}
		this.length = this.keys.length;
		var value = object[key];
		delete object[key];
		return value;
	};
	 
	this._removeKeyFromArray = function(key) {
		var id = -1;
		for(var i = 0; i < keys.length; i++) {
			if(keys[i] === key) {
				id = i;
				break;
			}
		}
		if(id > -1)
			keys.splice(id, 1);
	};
	
	
	/*
	 *	Sorts the keys alphabetically or by provided sorting functionality
	 *	@param	{function}	[fn]	Sorting function
	*/
	this.sort = function(fn) {
		keys.sort(fn);
	}
	
	this.hasNext = function() {
		return pointer < keys.length;
	};
	
	this.next = function() {
		if(this.hasNext()) {
			var key = keys[pointer];
			pointer++;
			return {key: key, value: this.get(key)};
		}
	};
	
	this.nextKey = function() {
		if(this.hasNext()) {
			return keys[pointer];
		}
	};
	
	this.hasPrevious = function() {
		return pointer > 0;
	};
	
	this.previous = function() {
		if(this.hasPrevious()) {
			pointer--;
			var key = keys[pointer];
			return {key: key, value: this.get(key)};
		}
	};
	
	this.previousKey = function() {
		if(this.hasPrevious()) {
			return keys[pointer-1];
		}
	};
	
	/**
	 *	Gets the value stored under given key
	 *
	 *	@this	{Map}
	 *	@param	{string|number}	key		A value that represents key for value retrieval
	 *	@return	{any}					Returns the value stored under the key or undefined if key isnt found
	 */
	this.get = function(key) {
		return object[key];
	};

	/**
	 *	Gets the value stored under given order number
	 *
	 *	@this	{Map}
	 *	@param	{number}	id		Order number in keys array
	 *	@return	{any}				Returns the value stored under the key or null if key isnt found
	 */
	this.getById = function(id) {
		return this.get(keys[id]);
	};

	/**
	 *	Gets the value stored under the last entered key
	 *
	 *	@this	{Map}
	 *	@return	{any}				Returns the value stored under the key or null if key isn't found
	 */
	this.getLast = function() {
		return this.getById(keys.length-1);
	};

	/**
	 *	Gets the value stored under the first entered key
	 *
	 *	@this	{Map}
	 *	@return	{any}				Returns the value stored under the key or null if key isn't found
	 */
	this.getFirst = function() {
		return this.getById(0);
	};

	/**
	 *	Gets a key name labeling the given value
	 *
	 *	@this	{Map}
	 *	@param	{any}	value		Value used to find the keyname
	 *	@return	{string|number}		Returns key name under which given value is stored
	 */
	this.getKey = function(value) {
		return this.find(value); //SLOW
	};

	/**
	 *	Gets this map's object containing keys and values
	 *
	 *	@this	{Map}
	 *	@return	{object}	object containing keys and values
	 */
	this.entrySet = function() {
		return object;
	};


	/**
	 *	Checks if the map is empty
	 *
	 *	@this	{Map}
	 *	@return	{boolean}	returns true if Map is empty, otherwise false.
	 */
	this.isEmpty = function() {
		return this.length === 0 ? true : false;
	};

	/**
	 *	Does the map contain given key?
	 *
	 *	@this	{Map}
	 *	@param	{string|number}	key 	
	 *	@return	{boolean}				returns true if the given key exists in the map
	 */
	this.hasKey = function(key) {
		return object.hasOwnProperty(key);
	};

	/**
	 *	Does the map contain given value?
	 *
	 *	@this	{Map}
	 *	@param	{any}		value 		
	 *	@return	{boolean}				returns true if the given value exists in the map
	 */
	this.hasValue = function(value) { //SLOW O(n)
		return this.getKey(value) ? true : false;
	};

	/**
	 *	Returns list of all entry keys in the map
	 *
	 *	@this	{Map}	
	 *	@return	{array}				returns array of keys
	 */
	this.keys = function() {
		return keys;
	};

	/**
	 *	Returns list of all entry values in the map. SLOW! O(n)
	 *
	 *	@this	{Map}	
	 *	@return	{array}				returns array of values
	 */
	this.values = function() { //SLOW O(n)
		var res = [];
		for (var i in object) {
			res.push(object[i]);
		}
		return res;
	};

	/**
	 *	Checks if an other map is identical to this one! 
	 *	Can be very slow if they have same keys and number of entries.
	 *
	 *	@this	{Map}
	 *	@param 	{Map}	map 			
	 *	@return	{boolean}				returns true if they are identical
	 */
	this.equals = function(map) {
		if (this.length != map.length)
			return false;
		return ivar.equal(object, map.entrySet()); //SLOW
	};

	/**
	 *	Resets the contents of the map to empty state
	 *
	 *	@this	{Map}
	 */
	this.clear = function() {
		this.length = 0;
		object = {};
		keys = [];
	};

	/**
	 *	For each entry of the map executes the given function
	 *
	 *	@this	{Map}
	 *	@param 	{function}	function(key,value) 	Given functions that receives key and value as arguments
	 */
	this.each = function(fn) {
		for (var i in object) {
			fn(i, object[i]);
		}
	};
	
	/**
	 *	Gets key name that holds supplied value
	 *
	 *	@this	{Map}
	 *	@param 	{any}	value	Given value as a search parameter
	 */
	this.find = function(value) {
		for (var i in object) {
			if(value === object[i])
				return i;
		}
	};
	
	if(o) this.incorporate(o);
};
