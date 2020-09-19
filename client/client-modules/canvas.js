import * as Utility from "./utility.js";
import {Vector2} from "./vector2.js";
import {instances, Instance} from "./instance.js";
import Camera from "./camera.js";
export default class Canvas {
	constructor(canvasElement) {
		if (! canvasElement) {
			throw new Error("No canvasElement provided");
		}

		this.className = "Canvas";
		this.name = "Canvas";
		
		this.canvasElement = canvasElement;
		this.ctx = this.canvasElement.getContext("2d");

		this.camera = null;
		this.scaling = new Vector2(1, 1);
		this.lighthouseMode = true;

		this.resize();
		console.log(`[%ccanvas.js%c] Locked and loaded!`, "color: purple", "color: black");
	};

	resize() {
		this.canvasElement.width = this.canvasElement.parentElement.clientWidth;
		this.canvasElement.height = this.canvasElement.parentElement.clientHeight;
		this.canvasElement.halfWidth = this.canvasElement.width * 0.5;
		this.canvasElement.halfHeight = this.canvasElement.height * 0.5;
	}

	setScaling(x, y) {
		this.scaling.set(x, y);
		console.log(`${this.getClassName} ${this.getName} ${this.id} scaling set to (${x}, ${y})`);
	}
	bindCamera(camera) {
		return this.setCamera(camera);
	}
	setCamera(camera) {
		if (camera instanceof Camera) {
			// camera.parent = this;
			camera.setParent(this);
			this.camera = camera;
			if (!!! this.camera.scaling) {
				this.camera.scaling = this.scaling;
				// clone? reference pointer? pls no... probably is. actually, wait, good.
			}
			return true;
		}
		return false;
	}
	get getCamera() {
		return this.camera;
	}

	wipe() {
		this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
		return 0;
	}

	beginNewPath() {
		this.ctx.beginPath();
		return this;
	}
	closeNewPath() {
		this.ctx.closePath();
		return this;
	}
	changeLineWidth(i) {
		this.ctx.lineWidth = i || this.ctx.lineWidth;
		return this;
	}
	lineBetweenContinuous(...args) {
		if (args.length === 2 && args[0] instanceof Vector2 && args[1] instanceof Vector2) {
			this.ctx.moveTo(args[0].getX, args[0].getY);
			this.ctx.lineTo(args[1].getX, args[1].getY);
		} else if (args.length === 4 && args.every(item => typeof item === "number")) {
			this.ctx.moveTo(args[0], args[1]);
			this.ctx.lineTo(args[2], args[3]);
		} else {
			console.warn(`Different parameters than expected were provided to Canvas::lineBetweenContinuous()`);
		}
		return this;
	}
	lineBetween(...args) {
		this.ctx.beginPath();
		if (args.length === 2 && args[0] instanceof Vector2 && args[1] instanceof Vector2) {
			this.ctx.moveTo(args[0].getX, args[0].getY);
			this.ctx.lineTo(args[1].getX, args[1].getY);
		} else if (args.length === 4 && args.every(item => typeof item === "number")) {
			this.ctx.moveTo(args[0], args[1]);
			this.ctx.lineTo(args[2], args[3]);
		} else {
			console.warn(`Different parameters than expected were provided to Canvas::lineBetween()`);
		}
		this.ctx.closePath();
		return this;
	}
	circle(x, y, r) {
		if (r < 0) return 1;
		this.ctx.beginPath();
		this.ctx.arc(x, y, r, 0, Math.PI * 2);
		this.ctx.closePath();
		return this;
	}
	square(...args) {
		this.ctx.beginPath();
		if (args.length === 2 && args[0] instanceof Vector2 && args[1] instanceof Vector2) {
			this.ctx.rect(
				args[0].getX, args[0].getY,
				args[1].getX, args[1].getY
			);
		} else if (args.length === 4 && args.every(item => typeof item === "number")) {
			this.ctx.rect(
				args[0], args[1],
				args[2], args[3]
			);
		} else {
			console.warn(`Different parameters than expected were provided to Canvas::square()`);
		}
		this.ctx.closePath();
		return this;
	}
	centerSquare(...args) {
		this.ctx.beginPath();
		if (args.length === 2 && args[0] instanceof Vector2 && args[1] instanceof Vector2) {
			this.ctx.rect(
				args[0].getX - (args[1].getX * 0.5),
				args[0].getY - (args[1].getY * 0.5),
				args[1].getX,
				args[1].getY
			);
		} else if (args.length === 4 && args.every(item => typeof item === "number")) {
			this.ctx.rect(
				args[0] - (args[2] * 0.5),
				args[1] - (args[3] * 0.5),
				args[2],
				args[3]
			);
		} else {
			console.warn(`Different parameters than expected were provided to Canvas::centerSquare()`);
		}
		this.ctx.closePath();
		return this;
	}

	strokeprevious(style) {
		this.ctx.strokeStyle = style;
		this.ctx.stroke();
		return this;
	}
	fillprevious(style) {
		this.ctx.fillStyle = style;
		this.ctx.fill();
		return this;
	}

	update() {
		// console.log("update");
		// console.log(this);
		
		

		if (this.camera !== null) {

			this.camera.setRotation(this.camera.getRotation + 1);

			this.wipe();
			this.ctx.save();
			this.ctx.setTransform(this.scaling.getX, 0, 0, this.scaling.getY, 0, 0);

			this.ctx.translate(this.canvasElement.halfWidth - this.camera.getPosition.getX, this.canvasElement.halfHeight - this.camera.getPosition.getY);

			for (let [key, obj] of instances) {
				// if (obj.accelerateAccordingToMovementKeyStates !== undefined) obj.accelerateAccordingToMovementKeyStates();
				// if (obj.deccelerateAccordingToMovementKeyStates !== undefined) obj.deccelerateAccordingToMovementKeyStates();
				if (obj.upvelocityAccordingToMovementKeyStates !== undefined) obj.upvelocityAccordingToMovementKeyStates();
				if (obj.develocityAccordingToMovementKeyStates !== undefined) obj.develocityAccordingToMovementKeyStates();
				// if (obj.limitVelocityToMaximum !== undefined) obj.limitVelocityToMaximum();
				// if (obj.limitAccelerationToMaximum !== undefined) obj.limitAccelerationToMaximum();
				if (obj.move !== undefined) obj.move();
				if (obj.stopDrift !== undefined) obj.stopDrift();
				if (obj.teleportToOtherSideOfScreen !== undefined) obj.teleportToOtherSideOfScreen();
				if (obj.findOtherBoidsInViewingField !== undefined) obj.findOtherBoidsInViewingField();
				if (obj.simulateRules !== undefined) obj.simulateRules();
				// if (obj.limit_velocity !== undefined) obj.limit_velocity();

				if (obj.render !== undefined) obj.render();
			}

			this.circle(0, 0, 5).strokeprevious("black").fillprevious("black");
	
			this.circle(200, 200, 5);
			this.strokeprevious("black");
			this.fillprevious("white");
	
			this.circle(500, 500, 5);
			this.strokeprevious("black");
			this.fillprevious("black");

			this.ctx.restore();
		}
		

		window.requestAnimationFrame(this.update.bind(this));
	}



	
};