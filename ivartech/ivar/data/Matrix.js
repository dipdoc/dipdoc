//title: ivar.matrix.js
//desc: Simple Matrix JS class
//author: Nikola Stamatovic Stamat http://ivar.rs
//since: 26. April 2012.
//TODO: separate math and storage. test, fix, assign to correct namespaces
//master: ivar.utils.js
 
 
function Matrix(arg1, arg2) {
        this.width = 0;
        this.height = 0;
        this.matrix = new Array();
       
        if(typeof arg1 == 'object') {
                this.matrix = arg1;
                this.height = this.matrix.length;
                if(this.height != 0)
                        this.width = this.matrix[0].length;
                else
                        this.width = 0;
        } else if(typeof arg1 == 'number') {
                this.width = arg1;
                if(arg2 == undefined)
                        this.height = arg1;
                else
                        this.height = arg2;
                this.initEmpty();
        }
}
 
Matrix.prototype.initEmpty = function() {
        this.matrix = new Array(this.height);
        for (var i = 0; i < this.matrix.length; i++) {
                this.matrix[i] = new Array(this.width);
        }
}
 
Matrix.prototype.init = function(val) {
        this.matrix = new Array(this.height);
        for (var i = 0; i < this.matrix.length; i++) {
                this.matrix[i] = new Array(this.width);
                for (var j = 0; j < this.matrix[i].length; j++) {
                        this.matrix[i][j] = val;
                }
        }
}
 
Matrix.prototype.transpose = function() {
        var transposed = new Array(this.width);
        for (var i = 0; i < this.width; i++) {
                transposed[i] = new Array(this.height);
                for (var j = 0; j < this.height; j++ ) {
                        transposed[i][j] = this.matrix[j][i];
                }
        }
        return new Matrix(transposed);
}
 
Matrix.prototype.toString = function() {
        var rows = new Array();
        for (var i = 0; i < this.matrix.length; i++) {
                rows[i] = '|' + this.matrix[i].join() + '|';
        }
        return rows.join('\n');
}
 
Matrix.prototype.merge = function(matrix, from) {
        var m1 = new Array();
        var m2 = matrix;
       
        if(matrix.width != undefined) {
                m2 = m2.matrix;
        }
               
        if(from == 'left') {
                for (var i = 0; i < this.matrix.length; i++) {
                        m1[i] = this.matrix[i].concat(m2[i]);
                }
        } else if (from == 'rigth') {
                for (var i = 0; i < this.matrix.length; i++) {
                        m1[i] = m2[i].concat(this.matrix[i]);
                }
        } else if (from == 'top') {
                m1 = m2.concat(this.matrix);
        } else {
                m1 = this.matrix.concat(m2);
        }
       
        return new Matrix(m1);
}
 
//TODO: level two matrices so they can be merged
Matrix.prototype.level = function(matrix) {    
       
}
 
Matrix.prototype.flip = function(way) {
        var flipped = new Matrix(this.matrix);
        if(way == 'horizontal')
                for (var i = 0; i < flipped.height; i++) {
                        flipped.matrix[i].reverse();
                }
        else
                flipped.matrix = flipped.matrix.reverse();
       
        return flipped;
}
