ivar.namespace('ivar.data');

ivar.data.Graph = function() {
	this._nodes = {};
	this._links = {};
};

ivar.data.Graph.prototype.Node = function(obj) {
	this.__uid__ = '';
	this.__links__ = [];
	ivar.extend(this, obj);
};

ivar.data.Graph.prototype.Link = function(obj) {
	this.__uid__ = '';
	this.__nodes__ = [];
	ivar.extend(this, obj);
};

ivar.data.Graph.prototype.Link.prototype.getTarget = function(key) {
	if(this.__nodes__.length > 1) { //bothways
		var res = [];
		for (var i = 0; i < this.__nodes__.length; i++) {
			if (this.__nodes__[i].__uid__ != key) {
				res.push(this.__nodes__[i]);
			}
		}
		if(res.length == 1)
			return res[0];
		return res;
	} else { //oneway, can target self or other node
		return this.__nodes__[0];
	}
};

ivar.data.Graph.prototype.addNode = function(key, obj) {
	if(!ivar.isSet(obj))
		obj = {};
	if(!ivar.isSet(key)) {
		ivar.setUniqueObject(obj, this._nodes);
	} else {
		obj.__uid__ = key;
		this._nodes[key] = obj;
	}
};

ivar.data.Graph.prototype.removeNode = function(key) {
	//TODO unlink then delete
	delete this._nodes[key];
};

ivar.data.Graph.prototype.getNode = function(key) {
	return this._nodes[key];
};

ivar.data.Graph.prototype.link = function(obj, a, b) {
	var link = ivar.setUniqueObject(new this.Link(obj), this._links);
	
	for(var i = 1; i < arguments.length; i++) {
		var node = this.getNode(arguments[i]);
		link.__nodes__.push(node);
		if(!node.hasOwnProperty('__links__'))
			node.__links__ = [];
		node.__links__.push(link);
	}
	return link;
};

ivar.data.Graph.prototype.unlink = function(a, b) {
	
};

ivar.data.Graph.prototype.follow = function(depth, priority_field) {

};
