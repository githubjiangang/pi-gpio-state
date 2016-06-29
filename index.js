var testMode=false;
if(testMode){
	var gpio ={read:function(pin,callback){
		var value=false;
		switch(pin){
			case '1':
				value=true;
			break;
			case '3':
				value=false;
			break;
			case '4':
				value=true;
			break;
			defalut:
				value=false;
			break;						
		}
		callback(false,value);
	}};    
}else{
	var gpio = require("./pi-gpio");   // pi-gpip module	
}
var http = require('http');        // Http Server
var fs = require('fs');            // FileSystem
var server = new http.Server();    // Create a Http Server

server.listen(80);            //server prot:80
server.on('request', function(request, response) { //when a request come,trigger this function
    var url = require('url').parse(request.url);
    console.log('request url',url);
    console.log('url.pathname',url.pathname);
    switch(url.pathname) {    
	    case ''||'/'||'/index'||'/index.html' ://  index.html
	        fs.readFile('./index.html', function(err, content){
	            if(err) {
	                response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
	                response.write(err.message);
	                response.end();
	            } else {
	                response.writeHead(200, { 'Content-Type' : 'text/html; charset=UTF-8' });
	                response.write(content);
	                response.end();
	            }
	        });          
	        break;    	
	    case '/getGpioState/fileWay': // get pin state from a json file
	        fs.readFile('./GpioState.json', function(err, content){
	            if(err) {
	                response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
	                response.write(err.message);
	                response.end();
	            } else {
	            	console.log('fileWay content',content);
	                response.writeHead(200, {'Content-type':'application/json; charset=UTF-8'});
	                response.write(content);
	                response.end();
	            }
	        });
	        break;   
	    case '/getGpioState/realTimeWay': //  get pin state from GPIO
	    	var args=getargs(url.query);
	    	var pin=Number(args['pin']);
	    	console.log('pin',pin);
		    gpio.read(pin, function(err, value) {
	            if(err) {
	                response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
	                response.write(err.message);
	                response.end();
	            } else {
	            	console.log('pin '+pin+' value:',value);
	                response.writeHead(200, { 'Content-type':'application/json; charset=UTF-8'});
	                response.write(JSON.stringify({key:pin,value:value}));
	                response.end();
	            }	    			
			}); 
	        break;                              

	    default:// get local file by type
		        var filename = url.pathname.substring(1);     
	        var type = getType(filename.substring(filename.lastIndexOf('.')+1));
	        fs.readFile(filename, function(err, content){
	            if(err) {
	                response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
	                response.write(err.message);
	                response.end();
	            } else {
	                response.writeHead(200, { 'Content-Type' : type });
	                response.write(content);
	                response.end();
	            }
	        });            
	        break; 	        
    } 
	   
});
process.on('uncaughtException',function(err){
    console.log('uncaughtException:',err);
});
function getType(endTag){
    var type=null;
    switch(endTag){
    case 'html' :
    case 'htm' :
        type = 'text/html; charset=UTF-8';
        break;
    case 'js' : 
        type = 'application/javascript; charset="UTF-8"';
        break;
    case 'css' :
        type = 'text/css; charset="UTF-8"';
        break;
    case 'txt' :
        type = 'text/plain; charset="UTF-8"';
        break;
    case 'json' :
        type = 'application/json; charset="UTF-8"';
        break;        
    case 'manifest' :
        type = 'text/cache-manifest; charset="UTF-8"';
        break;
    default :
        type = 'application/octet-stream';
        break;
    }
    return type;
}
function getargs(url) {
    url=url.slice(url.indexOf('?')+1);
    var args = [];
    var items = url.split('&');
    var item = null, name = null, value = null;
    for (var i = 0; i < items.length; i++) {
        item = items[i].split('=');
        name = item[0];
        value = item[1];
        args[name] = value;
    }
    return args;
}
 
