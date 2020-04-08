const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = 5000 || process.env.PORT;

const rooms = new Map();
const clients = new Map();

class Client {
	constructor(socketId, socket) {
		this.socketId = socketId;
		this.socket = socket;
		this.inRoom = false;
		this.room = null;
		this.roomId = null;
		console.log(`[Create] Client ${this.socketId}  :SocketId=${this.socketId}  :InRoom=${this.inRoom}  :RoomId=${this.roomId}`);
	}
	_destroy() {
		if (this.room) {
			// if not null
			this.room.removeClient(this.socketId);
		}
	}
	_setRoomId(roomId) {
		this.roomId = roomId;
		this.room = rooms.get(roomId);
		console.log(`Client ${this.socketId} set own room to Room ${roomId}`);
	}
	joinRoom(_room, pass) {
		if (typeof _room === "string") _room = rooms.get(_room);
		if (_room.addClient(this.socketId, pass)) {
			this.inRoom = true;
			this.room = _room;
			this.roomId = _room.id;
			return true;
		} else {
			this.inRoom = false;
			this.room = null;
			this.roomId = null;
			return false;
		}
	}
	leaveRoom() {
		if (this.roomId !== null || this.room !== null) {
			this.room = null;
			this.roomId = null;
			this.inRoom = false;
			return true;
		}
		return false;
	}

	details() {
		console.log(`Client ${this.socketId} = {
	socketId: ${this.socketId},
	socket: [Object Socket - contains circular references],
	inRoom: ${this.inRoom},
	room: ${this.room},
	roomId: ${this.roomId}\n}`);
	}
}

function clientAdded(socket) {
	clients.set(socket.id, new Client(socket.id, socket));
	socket.mafia_client = clients.get(socket.id);
	console.log(`[+] ${socket.id}`);
	socket.mafia_client.details();
}
function clientRemoving(socketId) {
	clients.delete(socketId);
	console.log(`[-] ${socketId}`);
}


class Room {
	constructor(id, name, pass) {
		this.id = id;
		this.name = name || "Room";
		this.password = pass;
		this.passwordProtected = (pass !== null) ? true : false;
		this.clients = new Map();
		this.numberOfClients = 0;
		this.maximumNumberOfClients = Infinity;

		console.log(`[Create] Room ${this.id}  :Name=${this.name}  :Password=${this.password}  :Clients=${[... this.clients.values()]}  :NumberOfClients=${this.numberOfClients}`);
	}
	addClient(client, pass=null) {
		if (this.numberOfClients >= this.maximumNumberOfClients || pass !== this.password) return false;
		if (typeof client === "string") client = clients.get(client);
		this.clients.set(client.id, client);
		client._setRoomId(this.id);
		this.numberOfClients = this.clients.size;
		console.log(`Room ${this.id} added Client ${client.id}`);
		return true;
	}
	removeClient(client) {
		if (typeof client === "string") client = this.clients.get(client);
		client.leaveRoom();
		this.clients.delete(client.id);
		this.numberOfClients = this.clients.size;
		console.log(`Room ${this.id} removed Client ${id}`);
	}
	clearClients() {
		for (const client of this.clients.values()) {
			this.removeClient(client);
		}
	}

	details() {
		console.log(`Room ${this.id} = {
	id: ${this.id},
	name: ${this.name},
	password: ${this.password},
	clients: ${[... this.clients.values()]},
	numberOfClients: ${this.numberOfClients}\n}`);
	}


	static createRoom(name, pass=null) {
		const id = Generics.generateRandomId();
		if (name === undefined) name = "Room";
		rooms.set(id, new Room(id, name, pass));
		return rooms.get(id);
	}
	static destroyRoom(room) {
		if (typeof room === "string") room = rooms.get(room);
		room.clearClients();
		room.numberOfClients = 0;
		room.maximumNumberOfClients = 0;
		room.name = "Room about to be destroyed";
		const roomName = room.name;
		const roomId = room.id;
		rooms.delete(roomId);
		console.log(`[Destroy] Room ${roomId} ${roomName} was destroyed.`);
	}
}



class Generics {
	static get getAlphabet() {
		return "abcdefghijklmnopqrstuvwxyz";
	}
	static generateRandomId(maxLen = 8) {
		let output = "";
		const alp = Generics.getAlphabet;
		for (let i=0; i<maxLen; i+=1) {
			output += alp[Math.floor(Math.random()*alp.length)];
		}
		return output;
	}
}


class RoomHandler {
	static createRoom(name, pass) {
		return Room.createRoom(name, pass);
	}
	static destroyRoom(room) {
		return Room.destroyRoom(room);
	}
}



io.on("connection", function(socket) {
	const socketId = socket.id;
	socket.on("disconnect", ()=>clientRemoving(socketId));


	socket.on("client->server:request-room-creation-with-name", (data, ack)=>{
		const {name, pass} = data;
		const room = RoomHandler.createRoom(name, pass);
		ack(room.id);
		console.log(`Created new Room #${room.id} with name ${room.name} - then sent ack with room-id`);
	});

	socket.on("client->server:request-join-room-with-id", (data, ack)=>{
		const {roomId, pass} = data;
		if (socket.mafia_client.joinRoom(String(roomId), pass)) {
			ack({
				success: true,
				room: socket.mafia_client.room
			});
			console.log(`Client ${socketId} joined Room ${roomId} successfully`);
		} else {
			ack({
				success: false,
				error: "Incorrect password"
			});
		}
	});

	socket.on("client->server:request-room-list", (data, ack)=>{
		ack({
			rooms: [... rooms]
		});
		console.log(`Sent rooms<Map> to Client ${socketId}`);
	});
	
	socket.on("log-rooms", (data, ack)=> {
		console.log([... rooms.values()]);
		ack({room: [... rooms.values()]});
	});

	clientAdded(socket);
});
app.use(express.static(__dirname + "/client"));
server.listen(PORT, ()=>{
	console.info(`NodeJS-Express Server opened on Localhost:${PORT}
Ctrl+C to halt\n`);
});




const bob = Room.createRoom("Some room I made");
bob.details();