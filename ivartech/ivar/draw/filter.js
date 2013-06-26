/**
 * Canvas filter engine
 * @author Nikola Stamatovic Stamat
 * @since 31. August 2012.
 * 
 * @todo: test, organize, comment the fucking code! Exclude jquery! :D
 */

ivar.require('ivar.draw.canvas');
ivar.require('ivar.draw.color');
//ivar.require('ivar.data.Matrix');

ivar.namespace('ivar.draw.filter');

var canvas1 = null;
var canvas2 = null;
 
$(document).ready(function() {
        var testKern = [[-1,-1,-1],
                        [-1,8,-1],
                        [-1,-1,-1]];
        var testKern1 = [[1,1,1],
                         [1,1,1],
                         [1,1,1]];
        var testKern2 = [[0,0,0],
                         [-1,1,0],
                         [0,0,0]];
                         
        var LoGKernel = ivar.draw.filter.generateLoGKernel(1.8, 4, 4);
        var gaus = ivar.draw.filter.generateGaussianKernel(1.2, 2, 2);
 
 
        ivar.draw.filter.initImage('images/img1.jpg', function(canvas){
                canvas1 = canvas;
                $('body').append(canvas1);
                //convert(canvas1, binarize);
                //convert(canv, function(idat, x, y){applyKernel(idat, x, y, LoGKernel)});
                //convert(canv, grayscale);
                //convert(canv, function(idat, x, y){applyKernel(idat, x, y, gaus)});
                //convert(canv, grayscale);
                //convert(canvas1, function(idat, x, y){binarize(idat, x, y, 30)});
                //convert(canv, grayscale);
        });
       
        ivar.draw.filter.initImage('images/img2.jpg', function(canvas){
                canvas2 = canvas;
                //$('body').append(canvas2);
                ivar.draw.canvas.compare(canvas2, canvas1, difference);
                //convert(canvas2, function(idat, x, y){applyKernel(idat, x, y, LoGKernel)});
                //convert(canv, grayscale);
                //convert(canv, function(idat, x, y){applyKernel(idat, x, y, gaus)});
                //convert(canv, grayscale);
                convert(canvas2, binarize);
                //convert(canv, grayscale);
               
        });
       
       // console.log(ivar.data.Matrix.printMatrix(LoGKernel));
});

ivar.draw.filter.initImage = function(uri, callback) {
	ivar.draw.canvas.loadImage(uri, function(img) {
		var canvas = ivar.draw.canvas.newCanvas(img.width, img.height);
		var ctx = $(canvas)[0].getContext('2d');
        ctx.drawImage(img, 0, 0);
		callback(canvas);
	});

ivar.draw.filter.convert = function(canvas, fn) {
	ivar.draw.canvas.eachPixel(canvas, fn);
};
 
ivar.draw.filter.Gaussian = function(sigma, x, y) {
	var sig = ivar.draw.filter.sigmoid(sigma, x, y);
	return (1/(Math.PI*Math.pow(sigma,2)))*Math.exp(-sig);
};
 
ivar.draw.filter.LoG = function(sigma, x, y) {
	var sig = ivar.draw.filter.sigmoid(sigma, x, y);
	return (-1/(Math.PI*Math.pow(sigma,4)))*(1-sig)*Math.exp(-sig);
};

ivar.draw.filter.sigmoid = function(sigma, x, y) {
	return (Math.pow(x,2)+Math.pow(y,2))/(2*Math.pow(sigma,2));
};

//TODO: use Matrix
ivar.draw.filter.generateGaussianKernel = function(sigma, dw, dh) {
	var kernel = new Array();
	for (var i = -dw; i < dw+1; i++) {
		kernel[i+dw] = new Array();
		for (var j = -dh; j < dh+1; j++) {
			kernel[i+dw][j+dh] = Math.round(ivar.draw.filter.Gaussian(sigma, i, j)*10);
		}
	}
	return kernel;
};
 
ivar.draw.filter.generateLoGKernel = function(sigma, dw, dh) {
	var kernel = new Array();
	for (var i = -dw; i < dw+1; i++) {
	kernel[i+dw] = new Array();
		for (var j = -dh; j < dh+1; j++) {
			kernel[i+dw][j+dh] = Math.round(LoG(sigma, i, j)*1000);
		}
	}
	return kernel;
};
 
ivar.draw.filter.grayscale = function(imageData, x, y) {
	var rgb = ivar.draw.canvas.getPixel(imageData, x, y);
	var hsv = ivar.draw.canvas.RGB2HSV(rgb[0],rgb[1],rgb[2]);
	var col = ivar.draw.canvas.HSV2RGB(hsv[0],0, hsv[2]);
	ivar.draw.canvas.setPixel(imageData, x, y, col);
}
 
ivar.draw.filter.invertedGrascale = function(imageData, x, y) {
	var rgb = ivar.draw.canvas.getPixel(imageData, x, y);
	var hsv = ivar.draw.color.RGB2HSV(rgb[0],rgb[1],rgb[2]);
	var col = ivar.draw.color.HSV2RGB(hsv[0], 0, 100-hsv[2]);
	ivar.draw.canvas.setPixel(imageData, x, y, col);
};
 
ivar.draw.filter.invert = function(imageData, x, y) {
        var rgb = ivar.draw.canvas.getPixel(imageData, x, y);
        ivar.draw.canvas.setPixel(imageData, x, y, [255-rgb[0],255-rgb[1],255-rgb[2]]);
};
 
ivar.draw.filter.binarize = function(imageData, x, y, t) {
	var rgb = ivar.draw.canvas.getPixel(imageData, x, y);
	var max = Math.max(rgb[0],rgb[1],rgb[2]);
	var percent = Math.round((max/255)*100);
	var res = [0,0,0];
	if(t == undefined)
		t = 50;
	if( percent>= t)
		res = [255,255,255];
	//var col = ivar.draw.canvas.HSV2RGB(hsv[0], 0, hsv[2]);
	ivar.draw.canvas.setPixel(imageData, x, y, res);
};

//CONVOLUTION
ivar.draw.filter.applyKernel = function(imageData, x, y, kernel) {
    var sum = [0,0,0];
    for (var i = 0; i < kernel.length; i++) {
            for (var j = 0; j < kernel[i].length; j++) {
                    var rgb = ivar.draw.canvas.getPixel(imageData, x+i, y+j);
                    sum[0]+= rgb[0]*kernel[i][j];
                    sum[1]+= rgb[1]*kernel[i][j];
                    sum[2]+= rgb[2]*kernel[i][j];
            }
    }
    ivar.draw.canvas.setPixel(imageData, x, y, sum);
};
 
ivar.draw.filter.difference(imageData1, imageData2, x, y) {
        var res = [0,0,0];
        var rgb1 = ivar.draw.canvas.getPixel(imageData1, x, y);
        var rgb2 = ivar.draw.canvas.getPixel(imageData2, x, y);
        res[0] = rgb1[0] - rgb2[0];
        res[1] = rgb1[1] - rgb2[1];
        res[2] = rgb1[2] - rgb2[2];
        ivar.draw.canvas.setPixel(imageData1, x, y, res);
};
