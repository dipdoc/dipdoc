ivar.namespace('ivar.data');

ivar.data.StringTree = function() {
	this.storage = {};
};

ivar.data.StringTree.prototype.put = function(string) {
	if(this.find(string) == null) {
		var storage = this.storage;
		if(!this.storage.hasOwnProperty('_$'))
			this.storage._$ = [];
		this.storage._$.push({val: string}); //initialize object used to reference through tree
	
		for (var i = 0; i < string.length; i++) {
			var c = string[i];
			if (!storage.hasOwnProperty(c))
				storage[c] = {};
			
			storage = storage[c];
			
			if (!storage.hasOwnProperty('_$'))
				storage._$ = [];
			storage._$.push(this.storage._$[this.storage._$.length-1]);
		}
		
		if (!storage.hasOwnProperty('_end'))
			storage._end = {};
	}
};

ivar.data.StringTree.prototype.browse = function(string) {
	var storage = this.storage;
	for (var i = 0; i < string.length; i++) {
		var c = string[i];
		if (storage.hasOwnProperty(c)) {
			storage = storage[c];
		} else {
			if(!storage.hasOwnProperty(c)) {
				return null;
			} else {
				return storage[c]._$;
			}
		}
	}
	return storage._$;
};

ivar.data.StringTree.prototype.find = function(string) {
	var storage = this.storage;
	for (var i = 0; i < string.length; i++) {
		var c = string[i];
		if (storage.hasOwnProperty(c))
			storage = storage[c];
		else
			return null;
	}
	
	if (storage.hasOwnProperty('_end'))
		return storage._end;
	else
		return null;
};

//TODO:
ivar.data.StringTree.prototype.remove = function(string) {
	if (this.find(string) != null) {
		var storage = this.storage;
		for (var i = 0; i < string.length; i++) {
			var c = string[i];
			if (storage[c]._$.length == 1) {
				delete storage[c];
				return;
			} else {
				//for(var i = 0; storage.)
			}
			
			storage = storage[c];
		}
	}
};
