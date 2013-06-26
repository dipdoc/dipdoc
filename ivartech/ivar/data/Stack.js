/**
 *	@file		Stack.js simple stack data structure
 *	@author		Nikola Stamatovic Stamat <stamat@ivartech.com>
 *	@copyright	IVARTECH http://ivartech.com
 *	@version	20130623  
 *	
 *	@namespace	ivar
 */
 
ivar.namespace('ivar.data');

ivar.data.Stack = function() {
    
    var a = {};
    var length = 0;
    
    this.push = function(v) {
        length++;
        a[length] = v;
    };
    
    this.pop = function() {
    	if(!this.isEmpty()) {
		    var res = this.top();
		    delete a[length];
		    length--;
		    return res;
        }
    }
    
    this.top = function() {
        return a[length];  
    };
    
    this.isEmpty = function() {
        return length === 0 ? true : false;   
    };
    
    this.flip = function() {
        var n = {};
        var c = 0;
        for(var i = length; i > 0; i--) {
            c++; 
            n[c] = a[i];   
        }
        a = n;
    };
    
    var i = 0;
    while (arguments.hasOwnProperty(i)) {
		this.push(arguments[i]);
		i++;
	}
};
