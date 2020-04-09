var socket;
var socketLoaded = false;
var enterGameButtonPressed = false;
var roomCreatorHidden = true;
try {
	socket = io();
	socketLoaded = true;
	console.info("%cSocket.IO loaded!", "color: green");
} catch {
	console.error("Socket.IO not loaded");
}

function getElement(e) {
	return document.querySelector(e);
}

class Generics {
	static createHTMLElement(el) {
		return document.createElement(el);
	}
	static getElement(e) {
		return getElement(e);
	}
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
	}
}
getElement("#enterGame").addEventListener("click", EnterGame.whenButtonPressed);


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
			getElement("#passwordarea-error").textContent = "Error: 1 attempt remaining.";
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
getElement("#create-room-btn").addEventListener("click", ServerListHandler.whenRoomCreatorButtonClicked);
getElement("#room-creator_locked").addEventListener("change", ServerListHandler.whenRoomCreatorLockedSliderChanged);
getElement("#room-creator_submit").addEventListener("click", ServerListHandler.whenRoomCreatorSubmitButtonClicked);
getElement("#passwordarea-submit").addEventListener("click", ServerListHandler.whenRoomPasswordInputSubmit);
getElement("#passwordarea-input").addEventListener("keydown", (e)=>{
	const evt = e || event;
	if (evt.key === "Enter") getElement("#passwordarea-submit").click();
});
getElement("#passwordarea-return").addEventListener("click", ServerListHandler.whenRoomPasswordReturnButtonClicked);


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