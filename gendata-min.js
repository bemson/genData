/*
 * genData v0.1
 * http://github.com/bemson/genData/
 *
 * Copyright 2011, Bemi Faison
 * Both released under the MIT License
 */
function genData(a){var b=arguments,c=b.callee,d=0,e,f,g,h,i,j,k;if(!(this.hasOwnProperty&&this instanceof c)){f=b[1]||[];function l(a){var b=0,c=[a.name,a.value,a.parent,g.length],d,e;while(b<f.length&&e!==!1){d=f[b++].apply(a,c);if(e||e===undefined||d===!1)e=d}return e||e===undefined}function m(a,b,c){this.name=a,this.value=b,this.parent=c}j=typeof b[2]=="function"?b[2]:c,m.prototype=j.prototype,m.prototype.constructor=j,g=[];if(a&&typeof a.every=="function"&&a.every(function(a){return a instanceof c}))a.forEach(function(a){var b=new m(a.name,a.value,a.parent);l(b)&&g.push(b)});else{h=[["",a]];while(h.length){i=h.pop(),k=new m(i[0],i[1],i[2]);if(l(k)){g.push(k);if(typeof k.value=="object")for(e in k.value)k.value.hasOwnProperty(e)&&h.unshift([e,k.value[e],k])}}}return g}if(a!==c){f=[],j=c,typeof b[1]=="object"&&b[1].forEach?(j=a,b=b[1]):b=[].slice.call(b),b.forEach(function(a){typeof a=="function"&&!c.prototype.isPrototypeOf(a)&&f.push(a)});return function(){function a(b,d,e){if(!(this.hasOwnProperty&&this instanceof a))return c(b,f.concat(d||[]),e&&e.protoype?e:a);if(b!==c)return new c(a,f.concat([].slice.call(arguments)));return this}a.prototype=new j(c),a.prototype.constructor=a;return a}()}return this}