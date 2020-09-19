export var socket;
export var socketLoaded = false;
export var enterGameButtonPressed = false;
export var roomCreatorHidden = true;
try {
	socket = io({
		transports: ["websocket"]
	});
	socketLoaded = true;
	socket.on("reconnect_attempt", ()=>{
		socket.io.opts.transports = ["polling", "websocket"];
	});
	console.info("%cSocket.IO loaded!", "color: green");
} catch {
	console.error("Socket.IO not loaded");
}
console.log(socket);



class Dev {
	static logRooms() {
		socket.emit("log-rooms", {
			rooms: "all"
		}, function(other) {
			console.log("Logged rooms: ");
			console.log([... other.room]);
		});
	}
}













// Mafia, boilerplate code taken from "Boids"

import * as Utility from "./client-modules/utility.js";
import {Vector2} from "./client-modules/vector2.js";
import Canvas from "./client-modules/canvas.js";
import {instances, Instance, boids} from "./client-modules/instance.js";
import Entity from "./client-modules/entity.js";
import Actor from "./client-modules/actor.js";
import Camera from "./client-modules/camera.js";
import Player from "./client-modules/player.js";
import {UserInputService, controlsApplyTo} from "./client-modules/userInputService.js";
const getElement = Utility.getElement;


export var mouse = {x: undefined, y: undefined};
export var deltaTimeMultiplier = 1;

const mainCanvas = new Canvas(Utility.getElement("#canvas"));
window.addEventListener("resize", mainCanvas.resize.bind(mainCanvas));
export {mainCanvas};

const mainPlayer = new Player();
controlsApplyTo.set(mainPlayer.id, mainPlayer);
window.addEventListener("keydown", UserInputService.whenKeyboardDown);
window.addEventListener("keyup", UserInputService.whenKeyboardUp);
mainCanvas.canvasElement.addEventListener("mousedown", UserInputService.whenMouseDown);
mainCanvas.canvasElement.addEventListener("mouseup", UserInputService.whenMouseUp);
mainCanvas.canvasElement.addEventListener("click", UserInputService.whenMouseClick);
mainCanvas.canvasElement.addEventListener("mousemove", UserInputService.whenMouseMove);
export {mainPlayer};


const mainCamera = new Camera();
mainCamera.setPosition(0, 0);
mainCanvas.setCamera(mainCamera);
export {mainCamera};
console.log(mainPlayer);
mainPlayer.setPosition(new Vector2(200, 200)).setTransparency(0).setCanCollide(false);



const straightIntoCanvas = true;

if (straightIntoCanvas) {
	toggleVisiblityOnSections("enterGame", false)("serverList", false)("canvas-section", true);
	getElement("main").style.display = "none";
	mainCanvas.resize();
}




function toggleVisiblityOnSections(name, force) {
	if (force) {
		getElement(`section[name="${name}"]`).style.display = (force) ? "block" : "none";
	} else {
		if (getElement(`section[name="${name}"]`).style.display === "block") {
			getElement(`section[name="${name}"]`).style.display = "none";
		} else {
			getElement(`section[name="${name}"]`).style.display = "block";
		}
	}
	return toggleVisiblityOnSections;
}

class EnterGame {
	static whenButtonPressed() {
		if (socketLoaded) {
			if (enterGameButtonPressed) return 1;
			getElement("main").classList.add("changeColor");
			setTimeout(()=>{
				getElement("section[name='enterGame']").style.display = "none";
				getElement("section[name='serverList']").style.display = "block";
				ServerListHandler.updateRoomList();
			}, 2500);
			setTimeout(()=>{
				getElement("main").classList.replace("changeColor", "bg-white");
				getElement("main").classList.add("text-black");
			}, 5000);
			enterGameButtonPressed = true;
		} else {
			getElement("[name='enterError']").style.display = "block";
		}
		console.log(enterGameButtonPressed);
	}
}
const serverListRooms = new Map();
class ServerListHandler {
	static clearRoomList() {
		getElement("#matchmaking-scrollingList").innerHTML = "";
		serverListRooms.clear();
	}
	static refreshRoomList() {
		if (serverListRooms.size > 0) getElement("#matchmaking-empty").style.display = "none";
	}
	static updateRoomList() {
		socket.emit("client->server:request-room-list", {
			thanks: true
		}, function(data){
			ServerListHandler.clearRoomList();
			const newRooms = new Map(data.rooms);
			for (const _room of newRooms.values()) {
				ServerListHandler.deployRoomListObject(_room.id, _room.name, _room.passwordProtected);
			}
		});
	}
	static deployRoomListObject(roomId, roomName, locked=false) {

		const divRoom = document.createElement("div");
		divRoom.id = "room:" + roomId;
		divRoom.classList.add("room", "border-top", "border-grey", "p-1");

		const divRow = document.createElement("div");
		divRow.classList.add("row", "no-gutters");

		const divColRoomId = document.createElement("div");
		divColRoomId.classList.add("col");
		const pColRoomId = document.createElement("p");
		pColRoomId.classList.add("d-inline");
		pColRoomId.textContent = "#" + roomId;

		const divColRoomName = document.createElement("div");
		divColRoomName.classList.add("col");
		const pColRoomName = document.createElement("p");
		pColRoomName.classList.add("d-inline");
		pColRoomName.textContent = roomName;

		const divColPasswordLocked = document.createElement("div");
		divColPasswordLocked.classList.add("col");
		const pColPasswordLocked = document.createElement("p");
		pColPasswordLocked.classList.add("d-inline");
		pColPasswordLocked.textContent = (locked) ? "🔒" : "Open";
		pColPasswordLocked.mafia_locked = locked;
		divRoom.mafia_locked = locked;

		divColRoomId.appendChild(pColRoomId);
		divColRoomName.appendChild(pColRoomName);
		divColPasswordLocked.appendChild(pColPasswordLocked);
		divRow.appendChild(divColRoomId);
		divRow.appendChild(divColRoomName);
		divRow.appendChild(divColPasswordLocked);
		divRoom.appendChild(divRow);

		serverListRooms.set(roomId, divRoom);


		divRoom.addEventListener("click", ()=>{
			ServerListHandler.whenRoomListObjectClicked(divRoom);
		});

		getElement("#matchmaking-scrollingList").appendChild(divRoom);
		feather.replace();
	
		ServerListHandler.refreshRoomList();
	
		return 0;
	}

	static whenRoomListObjectClicked(html_element) {
		const roomId = html_element.id.replace("room:","");
		console.log(`${html_element} ; ${roomId}`);
		if (html_element.mafia_locked) {
			console.log("It's locked!");
			getElement("[name='listpart']").style.display = "none";
			getElement("[name='passwordarea']").style.display = "block";
			getElement("[name='passwordarea']").mafia_roomId = roomId;
		} else {
			console.log("It's not locked");
			ServerListHandler.sendRoomAccessInformation(roomId, null);
		}
	}
	static sendRoomAccessInformation(roomId, pass) {
		socket.emit("client->server:request-join-room-with-id", {
			roomId: roomId,
			pass: pass
		}, function(data){
			if (data.success) {
				console.log(`Acknowledged - whenRoomListObjectClicked - ${data}`);

				toggleVisiblityOnSections("serverList")("canvas-section");
				getElement("main").style.display = "none";

				return true;
			} else {
				return false;
			}
		});
		console.log(`User clicked, accessing Room ${roomId}`);
	}

	static whenRoomPasswordInputSubmit(e) {
		const evt = e || event;
		evt.preventDefault();
		console.log("Tried to input password!");
		const passwordareaInputNode = getElement("#passwordarea-input");
		const pass = passwordareaInputNode.value;
		const roomId = getElement("[name='passwordarea']").mafia_roomId;
		if (ServerListHandler.sendRoomAccessInformation(roomId, pass)) {
			console.log("Correct!");
		} else {
			console.log("Incorrect");
			getElement("#passwordarea-error").style.display = "block";
			getElement("#passwordarea-error").textContent = "Error: Incorrect - Please confirm with your Party Leader";
		}
	}

	static whenRoomCreatorButtonClicked() {
		if (roomCreatorHidden) {
			getElement("#room-creator").style.display = "block";
			roomCreatorHidden = false;
		} else {
			getElement("#room-creator").style.display = "none";
			roomCreatorHidden = true;
		}
	}
	static whenRoomCreatorLockedSliderChanged() {
		const slider = getElement("#room-creator_locked");
		const inputField = getElement("#room-creator_password");
		if (slider.checked) {
			inputField.disabled = false;
		} else {
			inputField.disabled = true;
			inputField.value = "";
		}
	}
	static whenRoomCreatorSubmitButtonClicked(e) {
		const evt = e || event;
		evt.preventDefault();
		const errorTextNode = getElement("#room-creator_error");
		const roomNameNode = getElement("#room-creator_name");
		const roomLockedNode = getElement("#room-creator_locked");
		let roomName = roomNameNode.value.trim();
		const whitespaceRegex = /\s+/gi;
		roomName = roomName.replace(whitespaceRegex, " ");
		// console.log(`roomName = ${roomName}`);
		if (roomName.length > 32) {
			errorTextNode.style.display = "block";
			errorTextNode.textContent = "Error: Room Name cannot be more than 32 characters long!";
			return 1;
		} else if (roomName.length < 1) {
			errorTextNode.style.display = "block";
			errorTextNode.textContent = "Error: Room Name cannot be left blank!";
			return 1;
		}
		errorTextNode.style.display = "none";
		errorTextNode.textContent = "";

		let roomId = null;
		const roomPassNode = getElement("#room-creator_password");
		let passwd = roomPassNode.value.replace(whitespaceRegex, " ");
		console.log(`Entered password=${passwd}=End`);
		if (passwd === "" || passwd === " ") {
			passwd = null;
		}
		console.log(`Password=${passwd}=End; Typeof=${typeof passwd}`);

		// console.log("Registered: " + roomName);

		socket.emit("client->server:request-room-creation-with-name", {
			name: roomName,
			pass: passwd
		}, function(other){
			console.log(`Server assigned Room of name ${roomName} with ID: ${other}`);
			roomId = String(other);
			const isLocked = (passwd === null) ? false : (roomLockedNode.checked) ? true : false;
			ServerListHandler.deployRoomListObject(roomId, roomName, isLocked);
			getElement("#create-room-btn").click();
			getElement("#create-room-btn").blur();
		});
	}

	static whenRoomPasswordReturnButtonClicked() {
		getElement("[name='passwordarea']").style.display = "none";
		getElement("[name='listpart']").style.display = "block";
	}
}
Utility.getElement("#enterGame").addEventListener("click", EnterGame.whenButtonPressed);
Utility.getElement("#create-room-btn").addEventListener("click", ServerListHandler.whenRoomCreatorButtonClicked);
Utility.getElement("#room-creator_locked").addEventListener("change", ServerListHandler.whenRoomCreatorLockedSliderChanged);
Utility.getElement("#room-creator_submit").addEventListener("click", ServerListHandler.whenRoomCreatorSubmitButtonClicked);
Utility.getElement("#passwordarea-submit").addEventListener("click", ServerListHandler.whenRoomPasswordInputSubmit);
Utility.getElement("#passwordarea-input").addEventListener("keydown", (e)=>{
	const evt = e || event;
	if (evt.key === "Enter") getElement("#passwordarea-submit").click();
});
Utility.getElement("#passwordarea-return").addEventListener("click", ServerListHandler.whenRoomPasswordReturnButtonClicked);




































console.log(`[%cMAIN client.js%c] Loaded.`, "color: purple", "color: black");
window.requestAnimationFrame(mainCanvas.update.bind(mainCanvas));
