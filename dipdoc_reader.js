ivar.require('ivar.ui.navigation');

ivar.ready(function() {
ivar.ui.navigation.bindHashChange(function(m){
	console.log(m.keys());//dial m for murder
});

var idx = {};

var index = function(module) {
	var classes = {
		_unsorted: {
				'fields': [],
				'functions': [],
				'dependencies': []
			}
	};
	
	for (var i = 0; i < module.content.length; i++) {
		
		if(module.content[i].doc['class']) {
			classes[module.content[i].name.trim()] = {
				'fields': [],
				'functions': [],
				'dependencies': []
			};
			continue;
		}
		
		var cls = null;
		if(module.content[i].doc['this']) {
			if(classes.hasOwnProperty(module.content[i].doc['this'][0])){
				cls = classes[module.content[i].doc['this'][0]];
			}
		} else {
			cls = classes._unsorted;
		}
		
		if(cls) {
			if(module.content[i].type === 'field') {
				cls.fields.push(module.content[i]);
			} else if (module.content[i].type === 'function') {
				cls.functions.push(module.content[i]);
			} else if (module.content[i].type === 'dependency') {
				
				cls.dependencies.push(module.content[i]);
			}
		}
	}
	
	return classes;
}

console.log(dipdoc);
	dipdoc['js']['data'] = ivar.sortProperties(dipdoc['js']['data'])
	for(var i in dipdoc['js']['data']) {
		idx[i] = index(dipdoc.js.data[i]);
		$('.module-overview tbody').append('<tr><td width="250"><a href="#!module='+i+'">'+i+'</a></td><td>'+dipdoc['js']['data'][i].header.excerpt[0]+'</td></tr>');
	}
	
	console.log(idx);
});
