//SOME OLD CODE from 2009 just for testing

ivar.namespace('ivar.html');

ivar.html.lol = 'lol';

ivar.html.clear = function(element){
	var e = this.select(element);
	if(e!==null){
		e.innerHTML="<span></span>";
		return e;
	}
};

ivar.html.create = function(element){
		return document.createElement(element);
};

//create+add+append
ivar.html.construct = function(element, where, what) {
	var e = this.create(element);
	e.innerHTML = what;
	var p = this.select(where);
	p.appendChild(e);
	return e;
};

ivar.html.append = function(element, where) {
	var e = this.select(where);
	e.appendChild(element);
};

ivar.html.add = function(element, what) {
	var e = this.select(element);
	e.innerHTML+=what;
};

ivar.html.replace = function(element, what) {
	var e = this.select(element);
	e.innerHTML=what;
	return e;
};

/**
 *	@param spec {String} name,id,tag 
 **/

//TODO: better and smartet select, attributes, classes
ivar.html.select = function(element,by,num){
	if(typeof element == 'object'){
		return element;
	}else{
		if(by){
			if(by === "id"){
				return document.getElementById(element);
			}	
			else if(by === "tag"){
					if(num != undefined){
						return document.getElementsByTagName(element)[num];
					}else{
						return document.getElementsByTagName(element);
					}
			}
			else if(by === "name"){
				if(num != undefined){
					return HTMLDocument.getElementsByName(element)[num];
				}else{
					return HTMLDocument.getElementsByName(element);
				}
			}
		} else {
			if(element){
				if(element.charAt(0) == '#')
					element = element.substring(1,element.length);
					
				return document.getElementById(element);
			}
		}
	}
};
