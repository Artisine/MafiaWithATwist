var socket;
var socketLoaded = false;
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
            getElement("main").classList.add("changeColor");
            setTimeout(()=>{
                getElement("section[name='enterGame']").style.display = "none";
                getElement("section[name='serverList']").style.display = "block";
            }, 2500);
            setTimeout(()=>{
                getElement("main").classList.replace("changeColor", "bg-white");
                getElement("main").classList.add("text-black");
            }, 5000);
        } else {
            getElement("[name='enterError']").style.display = "block";
        }
    }
}
getElement("#enterGame").addEventListener("click", EnterGame.whenButtonPressed);


const serverListRooms = new Map();
class ServerListHandler {

    static refreshServerList() {
        if (serverListRooms.size > 0) getElement("#matchmaking-empty").style.display = "none";
    }
    static createMatchmakingListObject(roomId, locked=false) {
        let parent = Generics.createHTMLElement("div");
        parent.id = "matchmaking-room:" + roomId;
        parent.classList.add("matchmaking-listObject", "border-top", "border-grey", "p-1");
    
        let container = Generics.createHTMLElement("div");
        container.classList.add("clearfix");
    
        let roomName = Generics.createHTMLElement("p");
        roomName.classList.add("d-inline", "float-left", "margin0");
        roomName.innerHTML = (locked) ? "" + roomId + ` <i data-feather="lock"></i>` : "" + roomId;
        
        let enterButton = Generics.createHTMLElement("a");
        enterButton.classList.add("d-inline", "float-right", "margin0", "text-danger");
        enterButton.style.cursor = "pointer";
        enterButton.innerHTML = "Enter &gt;";
    
        container.appendChild(roomName);
        container.appendChild(enterButton);
        parent.appendChild(container);
    
        serverListRooms.set(roomId, parent);
    
        getElement("#matchmaking-scrollingList").appendChild(parent);
        feather.replace();
    
        ServerListHandler.refreshServerList();
    
        return 0;
    }
}


