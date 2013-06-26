/*\
|*|
|*|  JXON framework - Copyleft 2011 by Mozilla Developer Network
|*|
|*|  https://developer.mozilla.org/en-US/docs/JXON
|*|
|*|
|*|		JXON.toJSON(xml);
|*|		JXON.toXML(json);
\*/
 
var JXON=new function(){function u(a){return z.test(a)?null:A.test(a)?"true"===a.toLowerCase():isFinite(a)?parseFloat(a):isFinite(Date.parse(a))?new Date(a):a}function s(){}function v(a,d,f,b){var g=q.length,c=a.hasChildNodes(),j=a.hasAttributes(),k=Boolean(d&2),r,m=0,n="",h=k?{}:!0;if(c)for(var e,p=0;p<a.childNodes.length;p++)e=a.childNodes.item(p),4===e.nodeType?n+=e.nodeValue:3===e.nodeType?n+=e.nodeValue.trim():1===e.nodeType&&!e.prefix&&q.push(e);p=q.length;e=u(n);if(!k&&(c||j))h=0===d?null===
e?new s:e instanceof Object?e:new e.constructor(e):{};for(var l=g;l<p;l++)c=q[l].nodeName.toLowerCase(),r=v(q[l],d,f,b),h.hasOwnProperty(c)?(h[c].constructor!==Array&&(h[c]=[h[c]]),h[c].push(r)):(h[c]=r,m++);if(j){j=a.attributes.length;p=b?"":w;c=b?{}:h;for(l=0;l<j;m++,l++)r=a.attributes.item(l),c[p+r.name.toLowerCase()]=u(r.value.trim());b&&(f&&Object.freeze(c),h[x]=c,m-=j-1)}3===d||(2===d||1===d&&0<m)&&n?h[y]=e:!k&&(0===m&&n)&&(h=e);f&&(k||0<m)&&Object.freeze(h);q.length=g;return h}function t(a,
d,f){var b,g;f instanceof String||f instanceof Number||f instanceof Boolean?d.appendChild(a.createTextNode(f.toString())):f.constructor===Date&&d.appendChild(a.createTextNode(f.toGMTString()));for(var c in f)if(b=f[c],!(isFinite(c)||b instanceof Function))if(c===y)null!==b&&!0!==b&&d.appendChild(a.createTextNode(b.constructor===Date?b.toGMTString():String(b)));else if(c===x)for(var j in b)d.setAttribute(j,b[j]);else if(c.charAt(0)===w)d.setAttribute(c.slice(1),b);else if(b.constructor===Array)for(var k=
0;k<b.length;k++)g=a.createElement(c),t(a,g,b[k]),d.appendChild(g);else g=a.createElement(c),b instanceof Object?t(a,g,b):null!==b&&!0!==b&&g.appendChild(a.createTextNode(b.toString())),d.appendChild(g)}var y="keyValue",x="keyAttributes",w="@",q=[],z=/^\s*$/,A=/^(?:true|false)$/i;s.prototype.toString=function(){return"null"};s.prototype.valueOf=function(){return null};this.toJSON=function(a,d,f,b){var g=1<arguments.length&&"number"===typeof d?d&3:1;return v(a,g,f||!1,3<arguments.length?b:3===g)};
this.toXML=function(a){var d=document.implementation.createDocument("","",null);t(d,d,a);return d}};
