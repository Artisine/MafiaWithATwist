// import Entity from "./entity.js";
import * as Utility from "./utility.js";
import Actor from "./actor.js";
import {Vector2} from "./vector2.js";
import {mainCanvas, mainPlayer} from "./../client.js";
import {controlsApplyTo} from "./userInputService.js";
export default class extends Actor {
	constructor() {
		super();
		this.className = "Player";
		this.name = "Player";
		
		this.boundControlMirrors = new Map();
		// this.movementKeysStates = {
		// 	"w": false,
		// 	"a": false,
		// 	"s": false,
		// 	"d": false
		// };
		
		// this.setImage(Utility.g("#image_rickSanchez"));
		

		console.log(`${this.className} ${this.id} created.`);
	}

	bindControlsTo(obj) {
		if (obj instanceof Actor) {
			controlsApplyTo.set(obj.id, obj);
			console.log(controlsApplyTo);
			this.boundControlMirrors.set(obj.id, obj);
			console.log(`Bound ${obj.getClassName} ${obj.id} to ${this.className} ${this.id} controls`);
		}
	}
	removeControlsFrom(obj) {
		try {
			if (typeof obj === "string") {
				this.boundControlMirrors.delete(obj);
				controlsApplyTo.delete(obj);
			} else {
				const id = obj.id;
				this.boundControlMirrors.delete(id);
				controlsApplyTo.delete(id);
			}
			console.log(`Removed mirrored controls from ${(obj instanceof Actor) ? obj.getClassName + " " + obj.getId : obj}`);
		} catch(err) {
			console.error(err);
		}
	}

	render() {
		if (this.getImage.src !== null && this.getImage.dimensions !== null) {
			mainCanvas.ctx.drawImage(
				this.getImage.src,
				this.getPosition.getX - this.getSize.getX*0.5, this.getPosition.getY - this.getSize.getY*0.5,
				this.getSize.getX, this.getSize.getY

			);
		} else {
			if (this.getTransparency < 1) {
				mainCanvas.ctx.save();
				mainCanvas.ctx.translate(this.getPosition.getX, this.getPosition.getY);
				
				mainCanvas.ctx.globalAlpha = 1 - this.getTransparency;
				// mainCanvas.centerSquare(this.getPosition, this.getSize);
				// mainCanvas.strokeprevious("black");
				// mainCanvas.fillprevious("blue");

				const radiusOfBobbleHead = (this.getSize.getX + this.getSize.getY) / 8;
				mainCanvas.circle(0, 0, radiusOfBobbleHead).strokeprevious("black").fillprevious("red");
				// mainCanvas.centerSquare(
				// 	new Vector2(this.directionFacing * radiusOfBobbleHead * 0.5, -radiusOfBobbleHead * 0.5),
				// 	new Vector2(radiusOfBobbleHead, radiusOfBobbleHead / 2)
				// ).strokeprevious("black").fillprevious("aqua");

				mainCanvas.ctx.beginPath();
				mainCanvas.ctx.ellipse(
					this.directionFacing * radiusOfBobbleHead * 0.5, -radiusOfBobbleHead * 0.5,
					radiusOfBobbleHead * 0.5, radiusOfBobbleHead / 4,
					0, 0, Math.PI * 2
				);
				mainCanvas.ctx.closePath();
				mainCanvas.strokeprevious("black").fillprevious("#4ad1e8");
				
// ctx.beginPath();
// ctx.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI);
// ctx.stroke();


				mainCanvas.centerSquare(0, 0, this.getSize.getX, this.getSize.getY).strokeprevious("black");


				mainCanvas.ctx.restore();
			}
		}
		
	}
};