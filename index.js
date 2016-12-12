var fs = require('fs');
var https = require('https');
var WebSocketServer = require('ws').Server;
var express = require("express");
var bodyParser = require("body-parser");

var serverConfig = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
};

var app = express();
var HTTPS_PORT = 8443;

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

var httpsServer = https.createServer(serverConfig, app).listen(HTTPS_PORT);

var NodeTtl = require( "node-ttl" );
var ttl = new NodeTtl();

var wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
    ws.send('conectado');
    ws.on('message', function(message) {
        wss.broadcast(message);
    });

wss.broadcast = function(data) {
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};

app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/sube':
	    console.log("sube");
            res.send("sube");
	    res.end();
            break;
    default: res.sendFile( __dirname + req.params[0]); 
    }
 });

app.post(/^(.+)$/, function(req, res){
    switch(req.params[0]) {
        case '/sube':
	    var idsube = req.body.id;
	    ttl.push('idsube', idsube, null, 60);
            //if (idsube == 2983963778){
            if (idsube == 1190857667 ){
 	        res.send("credito ok");
		ws.send("Reiniciar_Credito");
		console.log(ttl.get(['idsube']));
		}else{
            res.send("sin saldo");
		}
            res.end();
            break;
    default: res.sendFile( __dirname + req.params[0]);
    }
 });

});

console.log('Servidor corriendo');
