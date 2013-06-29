console.log(dipdoc);

var a = ['c','a', 'b'];
a.sort();
console.log(a);

$(document).ready(function() {
	for(var i in dipdoc['js']['data']) {
		$('body').append(i+' - '+dipdoc['js']['data'][i].header.excerpt+'<br />');
	}
});
