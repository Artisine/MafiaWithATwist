import * as Utility from "./utility.js";
import {Vector2} from "./vector2.js";
import {instances, Instance} from "./instance.js";
import {mainCanvas, mainCamera, deltaTimeMultiplier} from "../client.js";
export default class Entity extends Instance {
	constructor() {
		super();

		this.className = "Entity";
		this.name = "Entity";
		this.position = new Vector2(0, 0, this);
		this.size = new Vector2(100, 100, this);
		this.velocity = new Vector2(0, 0, this);
		this.acceleration = new Vector2(0, 0, this);
		this.maximumVelocity = 60;
		this.maximumAcceleration = 10;
		this.dynamicsStrings = ["position", "size", "velocity", "acceleration"];
		this.rotation = 0;
		this.canCollide = true;
		this.collisionGroup = 0;
		this.anchored = false;
		this.transparency = 0; //0=visible, 1=invisible;
		this.maximumHealth = 100;
		this.health = this.maximumHealth;
		this.healthRegenerationRate = 1; //unit per every second;
		this.invulnerable = false;

		this.shouldTeleportToOtherSideOfScreen = false;
		
		// console.log(`${this.className} ${this.id} created.`);
	}

	get getPosition() {
		return this.position;
	}
	get getSize() {
		return this.size;
	}
	get getVelocity() {
		return this.velocity;
	}
	get getAcceleration() {
		return this.acceleration;
	}
	get getMaximumVelocity() {
		return this.maximumVelocity;
	}
	get getMaximumAcceleration() {
		return this.maximumAcceleration;
	}
	get getRotation() {
		return this.rotation;
	}
	get getCanCollide() {
		return this.canCollide;
	}
	get getCollisionGroup() {
		return this.collisionGroup;
	}
	get getAnchored() {
		return this.anchored;
	}
	get getTransparency() {
		return this.transparency;
	}
	get getMaximumHealth() {
		return this.maximumHealth;
	}
	get getHealth() {
		return this.health;
	}
	get getHealthRegenerationRate() {
		return this.healthRegenerationRate;
	}
	get getInvulnerable() {
		return this.invulnerable;
	}


	setDynamics(variant, x, y) {
		if (! this.dynamicsStrings.includes(variant)) {
			console.warn(`Improper dynamic variant was stated; input: ${variant}`);
			return this;
		}
		// console.log(`variant is ${variant}, set to `, x, y);
		if (this[variant].getName !== variant) {
			this[variant].setName(variant);
			// console.log(`set name to vector2 to ${variant}`);
		}
		
		if (x !== undefined && x instanceof Vector2) {
			this[variant].set(x);
			// console.log(`x is Vector2`);
		} else if ((x !== undefined && y !== undefined) && (typeof x === "number" && typeof y === "number")) {
			this[variant].set(x, y);
			// console.log(`x is x, y is y`);
		} else {
			console.warn(`x or y was something unexpected`);
		}

		// console.log(`[${this.getClassName} ${this.getName} ${this.getId}] ${variant} was set via <entity>::setDynamics()`);
		return this;
	}
	setPosition(x, y) {
		return this.setDynamics("position", x, y);
	}
	setSize(x, y) {
		return this.setDynamics("size", x, y);
	}
	setVelocity(x, y) {
		// console.log(args);
		return this.setDynamics("velocity", x, y);
	}
	setAcceleration(x, y) {
		return this.setDynamics("acceleration", x, y);
	}


	setRotation(f) {
		this.rotation = f;
		return this;
	}
	setCanCollide(b) {
		this.canCollide = b;
		return this;
	}
	setCollisionGroup(i) {
		this.collisionGroup = Utility.forceInteger(i);
		return this;
	}
	setAnchored(b) {
		this.anchored = Utility.forceBoolean(b);
		return this;
	}
	setTransparency(f) {
		this.transparency = Utility.forceFloat(f);
		return this;
	}
	setMaximumHealth(i) {
		this.maximumHealth = Utility.forceInteger(i);
		return this;
	}
	setHealth(i) {
		this.health = Utility.forceInteger(i);
		return this;
	}
	setHealthRegenerationRate(i) {
		// i-unit per second health regen;
		this.healthRegenerationRate = Utility.forceInteger(i);
		return this;
	}
	setInvulnerable(b) {
		this.invulnerable = Utility.forceBoolean(b);
		return this;
	}


	addDynamics(variant, x, y) {
		if (! this.dynamicsStrings.includes(variant)) {
			console.warn(`Improper dynamic variant was stated; input: ${variant}`);
			return this;
		}
		if (this[variant].getName !== variant) {
			this[variant].setName(variant);
		}

		if (x !== undefined && x instanceof Vector2) {
			this[variant].add(x);
			// console.log(`x is Vector2`);
		} else if ((x !== undefined && y !== undefined) && (typeof x === "number" && typeof y === "number")) {
			this[variant].add(x, y);
			// console.log(`x is x, y is y`);
		} else {
			console.warn(`x or y was something unexpected`);
		}
		// console.log(`[${this.getClassName} ${this.getName} ${this.getId}] ${variant} was added via <entity>::addDynamics()`);
		return this;
	}
	addPosition(x, y) {
		return this.addDynamics("position", x, y);
	}
	addSize(x, y) {
		return this.addDynamics("size", x, y);
	}
	addVelocity(x, y) {
		return this.addDynamics("velocity", x, y);
	}
	addAcceleration(x, y) {
		return this.addDynamics("acceleration", x, y);
	}
	addTransparency(f) {
		this.transparency += Utility.forceFloat(f);
		if (this.getTransparency > 1) this.getTransparency = 1;
		if (this.getTransparency < 0) this.getTransparency = 0;
		return this;
	}
	addHealth(i) {
		if (this.invulnerable) return this;
		this.health += Utility.forceInteger(i);
		if (this.getHealth > this.getMaximumHealth) this.setHealth(this.getMaximumHealth);
		if (this.getHealth < 0) this.death();
		return this;
	}


	limitVelocityToMaximum() {
		if (this.getVelocity.getX > this.getMaximumVelocity) this.getVelocity.setX(this.getMaximumVelocity);
		if (this.getVelocity.getY > this.getMaximumVelocity) this.getVelocity.setY(this.getMaximumVelocity);
	}
	limitAccelerationToMaximum() {
		if (this.getAcceleration.getX > this.getMaximumAcceleration) this.getAcceleration.setX(this.getMaximumAcceleration);
		if (this.getAcceleration.getY > this.getMaximumAcceleration) this.getAcceleration.setY(this.getMaximumAcceleration);
	}
	move() {
		// velocity is m/s
		// acceleration is m/s^2
		// time interval between frames is 1000/60ms, or 50ms

		// this.getVelocity.add(
		// 	(this.getAcceleration.getX / 60),
		// 	(this.getAcceleration.getY / 60)
		// );
		this.addVelocity(
			deltaTimeMultiplier * this.getAcceleration.getX / 60,
			deltaTimeMultiplier * this.getAcceleration.getY / 60
		);

		// this.getPosition.add(
		// 	(this.getVelocity.getX / 60),
		// 	(this.getVelocity.getY / 60)
		// );
		this.addPosition(
			deltaTimeMultiplier * this.getVelocity.getX / 60,
			deltaTimeMultiplier * this.getVelocity.getY / 60
		);

		// console.log(`${this.getClassName} ${this.getId} has Velocity , Acceleration , Position ,`, this.getVelocity, this.getAcceleration, this.getPosition);
	}
	death() {
		if (this.invulnerable) return this;
		console.log(`${this.getClassName} ${this.getName} ${this.getId} died.\nDestroy?`);
		this.destroy();
	}


	checkIfOutOfScreenBounds() {
		const halfX = this.getSize.getX * 0.5;
		const halfY = this.getSize.getY * 0.5;
		if (this.getPosition.getX < mainCamera.getPosition.getX - mainCanvas.canvasElement.halfWidth - halfX
		|| this.getPosition.getX > mainCamera.getPosition.getX + mainCanvas.canvasElement.halfWidth + halfX
		|| this.getPosition.getY < mainCamera.getPosition.getY - mainCanvas.canvasElement.halfHeight - halfY
		|| this.getPosition.getY > mainCamera.getPosition.getY + mainCanvas.canvasElement.halfHeight + halfY) {
			return true;
		} else {
			return false;
		}
	}
	teleportToOtherSideOfScreen() {
		if (this.checkIfOutOfScreenBounds() && this.shouldTeleportToOtherSideOfScreen) {
			// console.log(`teleporting...`);
			const halfX = this.getSize.getX * 0.5;
			const halfY = this.getSize.getY * 0.5;
			if (this.getPosition.getX < mainCamera.getPosition.getX - mainCanvas.canvasElement.halfWidth - halfX) {
				this.getPosition.setX(mainCamera.getPosition.getX + mainCanvas.canvasElement.halfWidth);
			}
			if (this.getPosition.getX > mainCamera.getPosition.getX + mainCanvas.canvasElement.halfWidth + halfX) {
				this.getPosition.setX(mainCamera.getPosition.getX - mainCanvas.canvasElement.halfWidth);
			}
			if (this.getPosition.getY < mainCamera.getPosition.getY - mainCanvas.canvasElement.halfHeight - halfY) {
				this.getPosition.setY(mainCamera.getPosition.getY + mainCanvas.canvasElement.halfHeight);
			}
			if (this.getPosition.getY > mainCamera.getPosition.getY + mainCanvas.canvasElement.halfHeight + halfY) {
				this.getPosition.setY(mainCamera.getPosition.getY - mainCanvas.canvasElement.halfHeight);
			}
		}
	}
}