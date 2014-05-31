var express = require('express');
var app = express();
var sys = require('sys');
// var path = require('path');

app.use("/styles", express.static(__dirname + "/styles"));
app.use("/scripts", express.static(__dirname + "/scripts"));

var port = process.env.PORT || 3000;
app.listen(port);

app.get('/', function (req, res){
	sys.log("showing / ");
	res.render(__dirname + '/index.html', {});
});
	
app.get('/room/:roomName', function (req, res){

});

app.get('/newRoom/:roomName', function (req, res){

});

function addUrl(url, room){

}