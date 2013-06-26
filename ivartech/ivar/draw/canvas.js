ivar.namespace('ivar.draw.canvas');

ivar.draw.canvas.isCanvasSupported =  function(){
	if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
		var fv = new Number(RegExp.$1);
		if (fv < 3.6) {
			return false;
		}
	}
	var elem = document.createElement('canvas');
	return !!(elem.getContext && elem.getContext('2d'));
};

ivar.draw.canvas.getPixel = function(imageData, x, y) {
        var index = 4 * (y * imageData.width + x);
        var r = imageData.data[index];
        var g = imageData.data[index + 1];
        var b = imageData.data[index + 2];
       
        return [r, g, b];
};
 
ivar.draw.canvas.setPixel = function(imageData, x, y, rgb) {
        var index = 4 * (y * imageData.width + x);
        imageData.data[index] = rgb[0];
        imageData.data[index + 1] = rgb[1];
        imageData.data[index + 2] = rgb[2];
};

ivar.draw.canvas.loadImage = function(src, callback) {
        var img = new Image();
        img.onload = function() {
                callback(img);
        }
        img.src = src;
};
 
ivar.draw.canvas.newCanvas = function(width, height) {
        var canvas = document.createElement('canvas');
       	
       	if(ivar.isSet(width))
        	canvas.width = width;
        if(ivar.isSet(height))
        	canvas.height = height;
       
        return canvas;
};

ivar.draw.canvas.eachPixel = function(canvas, func) {
    var width = canvas.width;
    var height = canvas.height;
   
    var ctx = canvas.getContext('2d');

    var imageData = ctx.getImageData(0, 0, width, height);
    for (var i = 0; i < imageData.height; i++) {
            for (var j = 0; j < imageData.width; j++) {
                    func(imageData, j, i);
            }
    }
    ctx.putImageData(imageData, 0, 0);
}
 
ivar.draw.canvas.compare = function(canvas1, canvas2, func) {
    var width1 = canvas1.width;
    var height1 = canvas1.height;
    var width2 = canvas2.width;
    var height2 = canvas2.height;
   
    var ctx1 = canvas1.getContext('2d');
    var ctx2 = canvas2.getContext('2d');

    var imageData1 = ctx1.getImageData(0, 0, width1, height1);
    var imageData2 = ctx2.getImageData(0, 0, width2, height2);
    for (var i = 0; i < imageData1.height; i++) {
            for (var j = 0; j < imageData1.width; j++) {
                    func(imageData1, imageData2, j, i);
            }
    }
    ctx1.putImageData(imageData1, 0, 0);
};
