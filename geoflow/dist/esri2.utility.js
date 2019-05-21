/**
 * esri2.utility.js
 */
(function(window,undefined){
var isNull=function(v){
return (v===null||v===undefined);
};
var notNull=function(v){
return (v!==null&&v!==undefined);
};
var isEmpty =function(v){
return (v===null||v===undefined||v==="");
};
var notEmpty=function(v){
return (v!==null&&v!==undefined&&v!=="");
};
var isTrue=function(v){
return (v===true);
};
var isFalse=function(v){
return (v===false);
};
var getElem=function(id){
return __not_empty(id)? document.getElementById(id):null;
};
var addEvent=function(el,type,fn){
var i;
if (document.addEventListener){
if (el&&el.nodeName||el===window){
el.addEventListener(type,fn,false);
}
else if(el&&el.length){
for(i=0; i<el.length; i++){
__add_event(el[i],type,fn);
}
}
}
else{
if (el&&el.nodeName||el===window){
el.attachEvent('on'+type,function(){return fn.call(el,window.event);});
}
else if(el&&el.length){
for(i=0; i<el.length; i++){
__add_event(el[i],type,fn);
}
}
}
};
var getBrowserAgent=function(){
var brwr={};
var agent=navigator.userAgent.toLowerCase();
if (window.ActiveXObject && agent.indexOf('msie')!==-1){
brwr.ie=true;
}
else if (agent.indexOf('firefox')!==-1){
brwr.firefox=true;
}
else if (agent.indexOf('opera')!==-1){
brwr.opera=true;
}
else if (agent.indexOf('chrome')!==-1){
brwr.chrome=true;
}
else{ //??TODO:brwr.safari = false;
brwr.other=true;
}
return brwr;
};
var log_disabled=function(){
};
var log=function(){
// Thanks to Paul Irish for this one: http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
log.history = log.history || [];
log.history.push(arguments);
// Make sure console is present
if ('object'===typeof console){
// Setup console and arguments
var c=console[console.warn? 'warn':'log'],
args=Array.prototype.slice.call(arguments), a;
// Add marker to first argument if it's a string
if (typeof arguments[0]==='string') {
// args[0] = 'your marker: ' + args[0];
}
// Apply console.warn or .log if not supported
a=c.apply?c.apply(console,args):c(args);
}
};
var includeScript=function(js){
document.write('<script src="'+js+'"></script>');
};
var importScripts=(function(globalEval){
var xhr=new XMLHttpRequest();
return function importScripts(){
var
args=Array.prototype.slice.call(arguments),
len=args.length,
i=0,
meta,
data,
content
;
for(;i<len;i++){
if(args[i].substr(0,5).toLowerCase()==="data:"){
data=args[i];
content=data.indexOf(",");
meta=data.substr(5,content).toLowerCase();
data=decodeURIComponent(data.substr(content+1));
if(/;\s*base64\s*[;,]/.test(meta)){
data=atob(data);
}
if(/;\s*charset=[uU][tT][fF]-?8\s*[;,]/.test(meta)){
data=decodeURIComponent(escape(data));
}
}
else{
xhr.open("GET",args[i],false);
xhr.send(null);
data=xhr.responseText;
}
globalEval(data);
}
};
}(eval));
var usingScript=function(js){
try{
log("includeScript: ",js);
includeScript(js);
}
catch(e){
log("importScripts: ",js);
importScripts(js);
}
};
var getScriptPath = function(jsFileName) {
  var e = {};
  var htmlPath = "";
  var jsPath = "";

  if ( document.location.protocol === 'file:'){
    e.BasePath = unescape(document.location.pathname.substr(1));
    //e.BasePath = e.BasePath.replace(/\/\//gi, '/' ) ;
    e.BasePath = 'file://' + e.BasePath.substring(0,e.BasePath.lastIndexOf('/')+1);
    e.FullBasePath = e.BasePath;
  }
  else{
    e.BasePath = document.location.pathname.substring(0,document.location.pathname.lastIndexOf('/')+1);
    e.FullBasePath = document.location.protocol + '//' + document.location.host + e.BasePath;
  }

  htmlPath = e.FullBasePath; 
  var i, at, src, slc, scriptTag = document.getElementsByTagName("script");

  for(i=0;i<scriptTag.length;i++){
    src=scriptTag[i].src;
    at = src.lastIndexOf(jsFileName);
    if(at!==-1){
      at++;
      // scriptTag[i].src.replace( /\/\//gi, '/');
      slc=src.toLowerCase();
      if(slc.indexOf("file://")===0){
        jsPath = src.substring(0,at);
        break;
      }
      else if(slc.indexOf("http://")===0){
        jsPath = src.substring(0,at);
        break;
      }
      else if(slc.indexOf("https://")===0){
        jsPath = src.substring(0,at);
        break;
      }
      else if(slc.indexOf("../")===0){
        jsPath = htmlPath + src.substring(0,at);
        break;
      }
      else if(slc.indexOf("./")===0){
        jsPath = htmlPath + src.substring(0,at);
        break;
      }
      else if(slc.indexOf("/")===0){
        if(document.location.protocol === 'http:' || document.location.protocol === 'https:'){
          jsPath = document.location.protocol + "//" + document.location.host + src.substring(0,at);
        }
        break;
      }
      else if(slc.search(/^([a-z]{1}):/) >=0){
        jsPath = src.substring(0,at);
        break;
      }
      else{
        jsPath = htmlPath;
      }
    }
  }
  return jsPath;
};
var Base64 = {
// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;
  input = Base64._utf8_encode(input);
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output +
    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
  }
  return output;
},

// public method for decoding
decode : function (input) {
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  while (i < input.length) {
    enc1 = this._keyStr.indexOf(input.charAt(i++));
    enc2 = this._keyStr.indexOf(input.charAt(i++));
    enc3 = this._keyStr.indexOf(input.charAt(i++));
    enc4 = this._keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  output = Base64._utf8_decode(output);
  return output;
},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
  string = string.replace(/\r\n/g,"\n");
  var utftext = "";
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    }
    else if((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
  var string = "";
  var i = 0;
  var c = c1 = c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    }
    else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    }
    else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    } 
  }
  return string;
}
};
// public functions:
//
window.__is_null=isNull;
window.__not_null=notNull;
window.__is_empty=isEmpty;
window.__not_empty=notEmpty;
window.__is_true=isTrue;
window.__is_false=isFalse;
window.__get_elem=getElem;
window.__add_event=addEvent;
window.__browser=getBrowserAgent();
window.__log=log; // log_disabled;
window.__base64=Base64;
window.__using_script=usingScript;
window.__get_script_path = getScriptPath;
}(window));
if (window.esri2===undefined){
__log("esri2.utility.js: window.esri2 defined");
window.esri2={};
}
