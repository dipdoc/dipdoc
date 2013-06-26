ivar.namespace('ivar.draw.color');

ivar.draw.color.HSV2RGB = function(h,s,v) {
 
        var h = h/360;
        var s = s/100;
        var v = v/100;
       
        var r = 0;
        var g = 0;
        var b = 0;
       
        if (s == 0) {
                r = Math.round(v * 255);
                g = Math.round(v * 255);
                b = Math.round(v * 255);
        } else {
                var_h = h * 6;
                var_i = Math.floor(var_h);
                var_1 = v * (1 - s);
                var_2 = v * (1 - s * (var_h - var_i));
                var_3 = v * (1 - s * (1 - (var_h - var_i)));
               
                if (var_i == 0) {var_r = v; var_g = var_3; var_b = var_1}
                else if (var_i == 1) {var_r = var_2; var_g = v; var_b = var_1}
                else if (var_i == 2) {var_r = var_1; var_g = v; var_b = var_3}
                else if (var_i == 3) {var_r = var_1; var_g = var_2; var_b = v}
                else if (var_i == 4) {var_r = var_3; var_g = var_1; var_b = v}
                else {var_r = v; var_g = var_1; var_b = var_2};
               
                r = Math.round(var_r * 255);
                g = Math.round(var_g * 255);
                b = Math.round(var_b * 255);
        }
       
        return [r, g, b];
}
 
ivar.draw.color.RGB2HSV = function(r,g,b) {
 
        var computedH = 0;
        var computedS = 0;
        var computedV = 0;
       
        var r = parseInt( (''+r).replace(/\s/g,''),10 );
        var g = parseInt( (''+g).replace(/\s/g,''),10 );
        var b = parseInt( (''+b).replace(/\s/g,''),10 );
 
        if ( r==null || g==null || b==null ||
                isNaN(r) || isNaN(g)|| isNaN(b) ) {
                return;
        }
        if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
                return;
        }
        r=r/255; g=g/255; b=b/255;
        var minRGB = Math.min(r,Math.min(g,b));
        var maxRGB = Math.max(r,Math.max(g,b));
 
        if (minRGB==maxRGB) {
                computedV = minRGB;
                return [0,0,computedV];
        }
 
        var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
        var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
        computedH = 60*(h - d/(maxRGB - minRGB));
        computedS = (maxRGB - minRGB)/maxRGB;
        computedV = maxRGB;
        return [Math.round(computedH),Math.round(computedS*100),Math.round(computedV*100)];
}
