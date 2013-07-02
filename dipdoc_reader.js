console.log(dipdoc);

var a = ['c','a', 'b'];
a.sort();
console.log(a);

$(document).ready(function() {
	dipdoc['js']['data'] = ivar.sortProperties(dipdoc['js']['data'])
	for(var i in dipdoc['js']['data']) {
		$('table tbody').append('<tr><td><a href="#module='+i+'">'+i+'</a></td><td>'+dipdoc['js']['data'][i].header.excerpt[0]+'</td></tr>');
	}
});
