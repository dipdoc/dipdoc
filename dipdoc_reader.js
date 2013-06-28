console.log(dipdoc);

$(document).ready(function() {
	for(var i in dipdoc['data']) {
		$('body').append(i+' - '+dipdoc['data'][i].header.excerpt+'<br />');
	}
});
