ivar.require('ivar/html.js');
ivar.require('ivar.test.*');
ivar.require('ivar.patt.Events');
ivar.require('ivar.data.StringTree');
ivar.require('ivar.data.Graph');
ivar.require('ivar.data.Map');
//ivar.require('http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js');
ivar.require('ivar.net.Communication');

ivar.require('ivar.data.HashCache');
ivar.require('ivar.data.Iterator');

function assertFalse(bool) {
	console.error(!bool);
}

function assertTrue(bool) {
	console.error(bool);
}

function test() {
	ivar.echo(a);
	ivar.echo(b);
	
	function bench(fn) {
		var start=0,end=0;
		start = window.performance.now();
		fn();
		end = window.performance.now();
		return end-start;
	}
	
	var m = new ivar.data.Map({a: 1, b: 2, c:3, f:4, g:5, e:6});
	var a = ['a','b','c','e'];
	var o = {a: 1, b: 2, c:3, f:4, g:5, e:6};
	
	var example = {'a':1,
 'b':{'c':[1,2,[3,45],{'b':1, 'a':3},5],
 'd':{'q':function(){alert('foo')}, 'b':{'q':1, 'b':8},'c':4},
 'u':'lol'},
 'e':2};
 
 	console.log(JSON.stringify(ivar.sortProperties(example)));
	
	var o1 = ivar.clone(example);
	o1['a'] = 555;
	ivar.echo(o1);
	ivar.echo(ivar.extend(o, example));
	
	var i = new Iterator(m);
	var c = 6;
	while(i.hasNext()) {
		c--;
		ivar.echo(i.now());
		//if(i.now() === 'g')
		i.add('a'+c, c);
		//i.set();
		//i.remove();
		i.next();
	}
	
	ivar.echo(m.entrySet());
	
}

function asd() {
	var test = ['omgzlol','omfg','lol'];
	var test1 = ['omgzlol','rofl','zlol', 'yolo'];
	var test2 = ['rofl'];
	var st = new ivar.data.StringTree();
	st.put(test);
	st.put(test1);
	st.put(test2);
	//st.put('omg');
	//st.put('foo');
	//st.put('fool');
	
	var out = ivar.def({
		'int': function(a) {
			alert('Here is int '+a);
		},
		
		'float': function(a) {
			alert('Here is float '+a);
		},
		
		'string': function(a) {
			alert('Here is string '+a);
		},
		
		'int,string': function(a, b) {
			alert('Here is an int '+a+' and a string '+b);
		},
		'default': function(obj) {
			alert('Here is some other value '+ obj);
		}
		
	});
		
	var u = ivar.setUniqueObject().__uid__;
	ivar.echo(u);
	ivar.echo(window[u]);
	ivar.echo(ivar.uid());
	ivar.echo(st);
	ivar.echo(st.find(['omgzlol','omfg','lol']));
	ivar.namespace('ivar.lol.omg');
	ivar.lol.omg.zomg = 'yes!';
	ivar.echo(ivar.lol.omg.zomg);
	var h = ivar.html.create('h1');
	h.innerHTML = 'lol!';
	var b = document.body;
	b.appendChild(h);
	
	function    Lol  () {
		this.test = '2';
	}
	
	Lol.method(function rofl(){return 'lolzors'});
	
	function Rofl() {
	
	};
	
	function Animal() {
		this.genitals = true;
	};
	
	Animal.method(function say(){
		ivar.echo(this.says);
	});
	
	function Horse() {
		this.says = 'njiii';
		this.legs = 4;
	};
	
	Horse.inherit(Animal);
	
	function Bird() {
		this.says = 'ciuciu';
		this.legs = 2;
		this.wings = 2;
	};
	
	Bird.inherit(Animal);
	
	function Pegasus() {
		this.explodes = true;
	};
	
	Pegasus.inherit(Bird, Horse);
	
	var p = new Pegasus();
	
	ivar.echo(p);
	p.say();
	
	Rofl.inherit(Lol);
	var a = new Rofl();
	for(var i in a)
		ivar.echo(i);
	var lol = new Lol();
	ivar.echo(lol);
	//ivar.echo(lol.rofl());
	
	var g = new ivar.data.Graph();
	g.addNode('a');
	g.addNode('b');
	g.link({label: 'knows', distance: 26 },'a','b');
	g.link({label: 'knows', distance: 0 },'a');
	ivar.echo(g);
}

ivar.ready(test);
ivar.ready(asd);
