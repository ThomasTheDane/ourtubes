var express = require('express');
var app = express();
var path = require('path');
var redis = require('redis');
var urlLib = require('url');
var REDISCLOUD_URL = 'redis://rediscloud:ICLd5rSYCUpLsGto@pub-redis-19940.us-east-1-2.2.ec2.garantiadata.com:19940'
var redisURL = urlLib.parse(process.env.REDISCLOUD_URL || REDISCLOUD_URL);
var redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
redisClient.auth(redisURL.auth.split(":")[1]);

app.use("/styles", express.static(__dirname + "/styles"));
app.use("/scripts", express.static(__dirname + "/scripts"));

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var sys = require('sys');
var port = process.env.PORT || 3000;
server.listen(port);

//var roomQueues = {};
//var roomNames = {};

app.get('/', function (req, res){
	sys.log("showing / ");
	res.render(__dirname + '/index.ejs', {});
});
	
app.get('/room/:roomName', function (req, res){
	var roomName = req.params.roomName.toLowerCase();
//	redisClient.exists(roomName, function (err, doesExist){
//		if(doesExist == 1){
			sys.log('showign room: ' + roomName);
			res.render(__dirname + '/room.ejs', {roomName: roomName});
//		}else{
//			sys.log('attempt to access non-existing room: ' + roomName);
//			res.render(__dirname + '/noRoom.ejs', {});
//		}
//	});
	/*
	if(roomQueues.hasOwnProperty(roomName)){
		sys.log('showign room: ' + roomName);
		res.render(__dirname + '/room.ejs', {roomName: roomName});
	}else{
		sys.log('attempt to access non-existing room: ' + roomName);
		res.render(__dirname + '/noRoom.ejs', {});
	}
	*/
});

app.get('/newRoom/:roomName', function (req, res){
	var roomName = req.params.roomName.toLowerCase();
//	redisClient.exists(roomName, function (err, doesExist){
//		if(doesExist == 0){
	//redisClient.lpush(roomName, '', function(err, reply){
		sys.log('new Room being created named ' + roomName);
		res.send('room good')			
	//});
	//		roomQueues[roomName] = [];
	//		roomNames[roomName] = [];
//		}else{
//			res.send('ERROR ROOM DUPLICATE')
//		}
//	});
	/*
	if(! roomQueues.roomName){
		sys.log('new Room being created named ' + roomName);
		redisClient
		roomQueues[roomName] = [];
//		roomNames[roomName] = [];
		res.send('room good')
	}else{
		res.send('ERROR ROOM DUPLICATE')
	}
	*/
});

io.sockets.on('connection', function (socket) {
	sys.log('connection made');
	socket.on('join', function(data){
		var nickname = data.nickname;
		var roomName = data.roomName.toLowerCase();
		socket.join(roomName);
		//socket.set('info', {nickname: nickname, roomName: roomName});
		//sys.log(nickname + " just joined room " + roomName );
		//roomNames[roomName].push(nickname);
		redisClient.lrange(roomName, 0, -1, function (err, urls){
			sys.log('sending urls: ' + urls);
			socket.emit('urls', urls);
		});

//		socket.emit('urls', getUrls(roomName));
		//socket.emit('names', roomNames[roomName]);
		//socket.broadcast.to(roomName).emit('addName', nickname);
	});
	socket.on('addUrl', function(data){
		addUrl(data.url, data.roomName.toLowerCase());
		socket.broadcast.to(data.roomName.toLowerCase()).emit('addUrl', data.url);
	});
	// socket.on('disconnect', function(){
	// 	socket.get('info', function(err, data){
	// 		if(data != null){
	// 			var nickname = data.nickname;
	// 			var roomName = data.roomName.toLowerCase();
	// 			sys.log(nickname + " has just left room " + roomName);
	// 			var index = roomNames[roomName].indexOf(nickname);
	// 			roomNames[roomName].splice(index, 1);
	// 			socket.broadcast.to(roomName).emit('removeName', nickname);
	// 		}
	// 	});
	// });
});

function getUrls(room){
	redisClient.lrange(room, 0, -1, function (err, urls){
		return urls;
	})
}

function addUrl(url, room){
	//roomQueues[room].push(url);
	redisClient.lpush(room, url, function (err, reply){
		sys.log('number of urls in list is now: ' + reply);
	});
}