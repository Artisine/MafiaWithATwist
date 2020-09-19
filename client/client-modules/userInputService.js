
import {mainPlayer, mouse} from "./../client.js";


export var controlsApplyTo = new Map();
export class UserInputService {
	
	static whenKeyboardDown(e) {
		const ev = e || event;
		// console.log(`${ev.key} was pressed`);
		UserInputService.mainPlayerMovementStateUpdateWhenDown(ev.key);
	}
	static whenKeyboardUp(e) {
		const ev = e || event;
		// console.log(`${ev.key} was depressed`);
		UserInputService.mainPlayerMovementStateUpdateWhenUp(ev.key);
	}
	static whenMouseDown(e) {
		const ev = e || event;
		// console.log(`Mouse ${ev.button} was pressed`);
	}
	static whenMouseUp(e) {
		const ev = e || event;
		// console.log(`Mouse ${ev.button} was depressed`);
	}
	static whenMouseClick(e) {
		const ev = e || event;
		console.log(`Mouse ${ev.button} was clicked`);

	}
	static whenMouseMove(e) {
		const ev = e || event;
		mouse.x = ev.clientX;
		mouse.y = ev.clientY;
		// changeMouseCursorIfMouseOverBoid();
	}

	static isMouseOverBoid() {

	}
	static mainPlayerMovementStateUpdateWhenDown(key) {
		if (mainPlayer) {
			switch(key) {
				case "w":
				case "ArrowUp":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.w = true;
					}
					break;
				case "a":
				case "ArrowLeft":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.a = true;
					}
					break;
				case "s":
				case "ArrowDown":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.s = true;
					}
					break;
				case "d":
				case "ArrowRight":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.d = true;
					}
					break;
			}
		}
	}
	static mainPlayerMovementStateUpdateWhenUp(key) {
		if (mainPlayer) {
			switch(key) {
				case "w":
				case "ArrowUp":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.w = false;
					}
					break;
				case "a":
				case "ArrowLeft":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.a = false;
					}
					break;
				case "s":
				case "ArrowDown":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.s = false;
					}
					break;
				case "d":
				case "ArrowRight":
					for (let obj of [...controlsApplyTo.values()]) {
						obj.movementKeysStates.d = false;
					}
					break;
			}
		}
	}
	
}