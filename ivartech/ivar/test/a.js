ivar.require('ivar.test.b');
var a = 'zomg!';

ivar.ready(function(){
	console.log('a');
	ivar.echo(b);
});
