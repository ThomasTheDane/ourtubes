var express = require('express');
var app = express();
var sys = require('sys');

app.use("/styles", express.static(__dirname + "/styles"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/libs", express.static(__dirname + "/libs"));

var port = process.env.PORT || 3000;
app.listen(port);

app.get('/', function (req, res){
	sys.log("showing / ");
	res.sendfile(__dirname + '/index.html', {});
});
