/**
 * A hash table value value storage
 * Use it to quickly and resource efficiently find large objects or large strings in a very large collection. It uses CRC32 algorythm to convert supplied values into integer hashes and 
 * 
 * @author Nikola Stamatovic Stamat < stamat@ivartech.com >
 * @copyright ivartech < http://ivartech.com >
 * @version 1.0
 * @date 2013-07-02
 * @namespace ivar.data
 */
 
ivar.namespace('ivar.data');

/**
 *	Test depencancy
 */
ivar.require('ivar.data.Map');
 
/**
 * @example
 *	a = {'a':1,
		'b':{'c':[1,2,[3,45],4,5],
			'd':{'q':1, 'b':{q':1, 'b':8},'c':4},
			'u':'lol'},
		'e':2};
	
	b = {'a':1, 
		'b':{'c':[2,3,[1]],
			'd':{'q':3,'b':{'b':3}}},
		'e':2};
		
	c = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	
	var hc = new HashCache();
	hc.put({a:1, b:1});
	hc.put({b:1, a:1});
	hc.put(true);
	hc.put('true');
	hc.put(a)
	console.log(hc.exists(b))
	console.log(hc.exists(a))
	console.log(hc.exists(c))
	hc.remove(a)
	console.log(hc.exists(a))
	hc.put(c)
	console.log(hc.exists(c))
	
 * @class
 * @param	{array}	a	An array of values to store on init
 */
ivar.data.HashCache = function(a) {
	/**
	 * Keeps values in arrays labeled under typewise crc32 hashes
	 *
	 * @this	HashCache
	 * @protected
	 */
	var storage = {};
	
	/**
	 * Produces an integer hash of a given value
	 * If the object is passed, before JSON stringification the properties are ordered. Note that because crc32 hashes strings, then boolean true would be the same as string 'true' or a sting '123' would be the same as integer 123, etc... We could add some modifier to solve this but a chance of using this with a set of values different by type is low in common use.
	 *
	 * @this 	HashCache
	 * @protected
	 * @param	{any}	value 	Any value to be hashed
	 * @return	{integer}		Integer hash
	 *
	 * @see 	sortProperties
	 * @see 	ivar.whatis
	 * @see 	HashCache.types
	 */	
	var hashFn = function(value) {
		var type = ivar.types[ivar.whatis(value)];
		
		if (type === 5) {
			value = ivar.arrayStringify(value);
		} else if(type === 6) {
			value = ivar.orderedStringify(value);
		} else {
			value = value.toString();
		}

		return	ivar.crc32(value);
	};
	
	/**
	 * Checks if the value is stored under the selected hash key.
	 * Under the same hash can be stored one or more values, this happens due to hash collisions and entries other then first element of the array are called overflow entries.
	 *
	 * @this	HashCache
	 * @protected
	 *
	 * @param	{integer}	hash	Hash of the value
	 * @param	{any}		value	Submited value
	 * @return	{boolean}			Returns if the value is listed under its hash in HashCache instance
	 *
	 * @see HashCache.storage
	 * @see	ivar.equal
	 */
	var hashHoldsValue = function(hash, value) {
		var bucket = storage[hash];
		if (bucket && bucket.length > 0) {
			for (var i = 0; i < bucket.length; i++) {
				if(ivar.equal(bucket[i], value))
					return true;
			}
		}
		return false
	};
	
	/**
	 * Hashes the value and stores it in the hash table where the generated hash is a key
	 *
	 * @this {HashCache}
	 * @public
	 * @param	{any}	value 	Any value to be stored
	 *
	 * @see	HashCache.hashFn
	 * @see HashCache.hashHoldsValue
	 * @see HashCache.storage
	 */
	this.put = function(value) {
		var hash = hashFn(value);
		if(!hashHoldsValue(hash, value)) {
			if (storage.hasOwnProperty(hash)) {
				storage[hash].push(value);
			} else {
				storage[hash] = [value];
			}
		}
	}
	
	/**
	 * Checks if the value is listed in HashCache instance
	 *
	 * @this	HashCache
	 * @public
	 * @param	{any}	value 	Any value to be checked
	 * @return	{boolean}		If the value is listed
	 *
	 * @see	HashCache.hashFn
	 * @see HashCache.hashHoldsValue
	 */
	this.exists = function(value) {
		var hash = hashFn(value);
		return hashHoldsValue(hash, value);
	}
	
	/**
	 * Finds the value listed and removes it from the HashCache instance
	 *
	 * @this	HashCache
	 * @public
	 * @param	{any}	value 	Any value to be removed
	 * @return 	{boolean}		If the value existed and was removed
	 *
	 * @see	HashCache.hashFn
	 * @see HashCache.storage
	 * @see ivar.equal
	 */
	this.remove = function(value) {
		var hash = hashFn(value);
		var bucket = storage[hash];
		var res = false;
		if(bucket && bucket.length > 0) {
			for (var i = 0; i < bucket.length; i++) {
				if(ivar.equal(bucket[i], value)) {
					storage[hash].splice(i, 1);
					res = true;
				}
			}
			//Clean up
			if(bucket.length === 0) {
				delete storage[hash];
			}
		}
		return res;
	}
	
	
	//INIT
	if (a !== undefined && ivar.whatis(a) === 'array') {
		for (var i = 0; i < a.length; i++) {
			this.put(a[i]);
		}
	}
};
