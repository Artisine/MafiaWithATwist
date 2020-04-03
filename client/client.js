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