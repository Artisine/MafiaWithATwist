
import {mainCanvas, mainCamera} from "../client.js";
import Entity from "./entity.js";

export default class Effect extends Entity {
	constructor() {
		super();
		this.className = "Effect";
		this.name = "Particle Effect";
		
		this.colors = {
			stroke: "grey",
			fill: null
		};
		this.shape = "circle";
		this.radius = 0;
		
	}

	setColor(key, val) {
		this.colors[key] = val;
		return this;
	}
	setShape(shape) {
		this.shape = shape;
		return this;
	}
	setRadiusWithSize() {
		this.radius = (this.getSize.getX + this.getSize.getY) / 4;
		return this;
	}
	setRadius(radius) {
		this.radius = radius;
		return this;
	}
	get getRadius() {
		return this.radius;
	}

	render() {
		if (this.getTransparency < 1) {
			if (this.shape === "circle") {
				mainCanvas.circle(this.getPosition.getX, this.getPosition.getY, this.getRadius);
				if (this.colors.stroke) mainCanvas.strokeprevious(this.colors.stroke);
				if (this.colors.fill) mainCanvas.fillprevious(this.colors.fill);
			} else if (this.shape === "square") {
				mainCanvas.centerSquare(this.getPosition, this.getSize);
				if (this.colors.stroke) mainCanvas.strokeprevious(this.colors.stroke);
				if (this.colors.fill) mainCanvas.fillprevious(this.colors.fill);
			}
		}
	}
}