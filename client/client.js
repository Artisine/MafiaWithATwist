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

	static refreshRoomList() {
		if (serverListRooms.size > 0) getElement("#matchmaking-empty").style.display = "none";
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
		pColRoomName.textContent = "#" + roomName;

		const divColPasswordLocked = document.createElement("div");
		divColPasswordLocked.classList.add("col");
		const pColPasswordLocked = document.createElement("p");
		pColPasswordLocked.classList.add("d-inline");
		pColPasswordLocked.textContent = (locked) ? "🔒" : "Open";
		pColPasswordLocked.mafia_locked = locked;

		divColRoomId.appendChild(pColRoomId);
		divColRoomName.appendChild(pColRoomName);
		divColPasswordLocked.appendChild(pColPasswordLocked);
		divRow.appendChild(divColRoomId);
		divRow.appendChild(divColRoomName);
		divRow.appendChild(divColPasswordLocked);
		divRoom.appendChild(divRow);

		serverListRooms.set(roomId, divRoom);


		divRoom.addEventListener("click", ()=>{
			console.log(divRoom.id);
		});

		getElement("#matchmaking-scrollingList").appendChild(divRoom);
		feather.replace();
	
		ServerListHandler.refreshRoomList();
	
		return 0;
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

		// console.log("Registered: " + roomName);

		socket.emit("client->server:request-room-creation-with-name", {
			name: roomName
		}, function(other){
			console.log(`Server assigned Room of name ${roomName} with ID: ${other}`);
			
		});
	}
}
getElement("#create-room-btn").addEventListener("click", ServerListHandler.whenRoomCreatorButtonClicked);
getElement("#room-creator_locked").addEventListener("change", ServerListHandler.whenRoomCreatorLockedSliderChanged);
getElement("#room-creator_submit").addEventListener("click", ServerListHandler.whenRoomCreatorSubmitButtonClicked);
