var express = require('express');
var app = express();
var path = require('path');

app.use("/styles", express.static(__dirname + "/styles"));
app.use("/scripts", express.static(__dirname + "/scripts"));

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var sys = require('sys');
var port = process.env.PORT || 3000;
server.listen(port);

var roomQueues = {};
var roomNames = {};

app.get('/', function (req, res){
	sys.log("showing / ");
	res.render(__dirname + '/index.ejs', {});
});
	
app.get('/room/:roomName', function (req, res){
	var roomName = req.params.roomName.toLowerCase();
	sys.log('showign room: ' + roomName);
	res.render(__dirname + '/room.ejs', {roomName: roomName});
});

app.get('/newRoom/:roomName', function (req, res){
	var roomName = req.params.roomName.toLowerCase();
	if(! roomQueues.roomName){
		sys.log('new Room being created named ' + roomName);
		roomQueues[roomName] = [];
		roomNames[roomName] = [];
		res.send('room good')
	}else{
		sys.log('double room error');
		res.send('ERROR ROOM DUPLICATE')
	}
});

io.sockets.on('connection', function (socket) {
	socket.on('join', function(data){
		var nickname = data.nickname;
		var roomName = data.roomName.toLowerCase();
		socket.join(roomName);
		socket.set('info', {nickname: nickname, roomName: roomName});
		sys.log(nickname + " just joined room " + roomName );
		roomNames[roomName].push(nickname);
		socket.emit('urls', roomQueues[roomName]);
		socket.emit('names', roomNames[roomName]);
		socket.broadcast.to(roomName).emit('addName', nickname);
	});
	socket.on('addUrl', function(data){
		roomQueues[data.roomName.toLowerCase()].push(data.url);
		sys.log(roomQueues[data.roomName.toLowerCase()]);
		socket.broadcast.to(data.roomName.toLowerCase()).emit('addUrl', data.url);
	});
	socket.on('disconnect', function(){
		socket.get('info', function(err, data){
			if(data != null){
				var nickname = data.nickname;
				var roomName = data.roomName.toLowerCase();
				sys.log(nickname + " has just left room " + roomName);
				var index = roomNames[roomName].indexOf(nickname);
				roomNames[roomName].splice(index, 1);
				socket.broadcast.to(roomName).emit('removeName', nickname);
			}
		});
	});
});
