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
		console.log(`[Create] Client ${this.socketId}`);
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
	joinRoom(roomId) {
		rooms.get(roomId).addClient(this.socketId);
	}
}

function clientAdded(socket) {
	clients.set(socket.id, new Client(socket.id, socket));
	console.log(`[+] ${socket.id}`);
	console.log(`${socket.id} is in Room ${clients.get(socket.id).roomId}`);
}
function clientRemoving(socketId) {
	clients.delete(socketId);
	console.log(`[-] ${socketId}`);
}


class Room {
	constructor(id, name) {
		this.id = id;
		this.name = name || "Room";
		this.clients = new Map();

		console.log(`[Create] Room ${this.id}`);
	}
	addClient(client) {
		if (typeof client === "string") client = clients.get(client);
		this.clients.set(client.id, client);
		client._setRoomId(this.id);
		console.log(`Room ${this.id} added Client ${client.id}`);
	}
	removeClient(id) {
		this.clients.delete(id);
		console.log(`Room ${this.id} removed Client ${id}`);
	}

	details() {
		console.log(`Room ${this.id}, ${this.name},\n-Clients: ${this.clients}`);
	}


	static createRoom(name="Room") {
		const id = Generics.generateRandomId();
		rooms.set(id, new Room(id, name));
		return rooms.get(id);
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



io.on("connection", function(socket) {
	const socketId = socket.id;
	socket.on("disconnect", ()=>clientRemoving(socketId));

	

	clientAdded(socket);
});
app.use(express.static(__dirname + "/client"));
server.listen(PORT, ()=>{
	console.info(`NodeJS-Express Server opened on Localhost:${PORT}
Ctrl+C to halt\n`);
});




const bob = Room.createRoom("Some room I made");
bob.details();