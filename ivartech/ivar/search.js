//This needs all kinds of testing... work on it more... again just for test...

ivar.search = {};
/**
 *	@param	{boolean}			[sorted=true]
 *	@param	{number|string}		[field]
 *	@todo TEST
 */
ivar.search.quickSearch = function(arr, key, sorted, field) {
	var found = [];
	if(!ivar.isSet(sorted))
		sorted = true;

	if(!sorted)
		if(ivar.isSet(field)) {
			return ivar.sortObjectsBy(found, field);
		} else {
			arr.sort();
		}
	var start = ivar.search.binaryKeySearch(arr, key, field); //TODO: wtf is this???
	if(isSet(start)) {
		for(var i = start+1; i < arr.length; i++) {
			var elem = arr[i];
			if(isSet(field))
				elem = elem[field];
			if(elem.startsWith(key)) {
				found.push(arr[i]);
			} else {
				break;
			}
		}
		for(var i = start; i >= 0; i--) {
			var elem = arr[i];
			if(isSet(field))
				elem = elem[field];
			if(elem.startsWith(key)) {
				found.push(arr[i]);
			} else {
				break;
			}
		}
	}
	
	if(ivar.isSet(field)) {
		return ivar.sortObjectsBy(found, field);
	} else {
		return found.sort();
	}
};

ivar.search.binaryKeySearch = function(arr, key, field, caseSensitive) {
	var low = 0, high = arr.length - 1, i;
	while (low <= high) {
		i = Math.floor((low + high) / 2);
		var pre;
		if(isSet(field)) {
			pre = arr[i][field].substring(0, key.length);
		} else {
			pre = arr[i].substring(0, key.length);
		}
		if(!isSet(caseSensitive))
			caseSensitive = false;
		if(!caseSensitive)
			pre = pre.toLowerCase();
		if (pre < key) { low = i + 1; continue; };
		if (pre > key) { high = i - 1; continue; };
		return i;
	}
	return null;
};

ivar.search.binarySearch = function(arr, find) {
	var low = 0, high = arr.length - 1, i;
	while (low <= high) {
		i = Math.floor((low + high) / 2);
		if (arr[i] < find) { low = i + 1; continue; };
		if (arr[i] > find) { high = i - 1; continue; };
		return i;
	}
	return null;
};
