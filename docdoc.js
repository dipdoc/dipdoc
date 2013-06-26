console.log(docdoc);

$(document).ready(function() {
	for(var i in docdoc) {
		$('body').append(i+' - '+docdoc[i].header.file+'<br />');
	}
});
