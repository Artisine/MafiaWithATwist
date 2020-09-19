import * as Utility from "./utility.js";
import {Vector2} from "./vector2.js";
import Entity from "./entity.js";


export default class Actor extends Entity {
	constructor() {
		super();

		this.className = "Actor";
		this.name = "Actor";

		this.movementKeysStates = {
			"w": false,
			"a": false,
			"s": false,
			"d": false
		};

		this.image = {
			src: null,
			originalDimensions: null,
			dimensions: null
		};
		this.velocityMultiplier = 20;
		this.accelerationMultiplier = 2;
		this.directionFacing = 1;

		console.log(`${this.className} ${this.id} created.`);
	}

	get getImage() {
		return this.image;
	}
	setImage(src) {
		this.image.src = src;
		this.image.originalDimensions = new Vector2(this.image.src.naturalWidth, this.image.src.naturalHeight);
		this.image.dimensions = new Vector2(this.image.src.width, this.image.src.height);
		return this;
	}


	get getMovementKeysStates() {
		return this.movementKeysStates;
	}

	accelerateAccordingToMovementKeyStates() {
		if (this.getMovementKeysStates.w) {
			this.getAcceleration.add(0, -10 * this.accelerationMultiplier);
		}

		if (this.getMovementKeysStates.a) {
			this.getAcceleration.add(-10 * this.accelerationMultiplier, 0);
		}

		if (this.getMovementKeysStates.s) {
			this.getAcceleration.add(0, 10 * this.accelerationMultiplier);
		}

		if (this.getMovementKeysStates.d) {
			this.getAcceleration.add(10 * this.accelerationMultiplier, 0);
		}
	}
	deccelerateAccordingToMovementKeyStates() {
		if (! this.getMovementKeysStates.w) {
			if (this.getAcceleration.getY < 0) {
				this.getAcceleration.add(0, 100);
			}
		}

		if (! this.getMovementKeysStates.a) {
			if (this.getAcceleration.getX < 0) {
				this.getAcceleration.add(100, 0);
			}
		}

		if (! this.getMovementKeysStates.s) {
			if (this.getAcceleration.getY > 0) {
				this.getAcceleration.add(0, -100);
			}
		}

		if (! this.getMovementKeysStates.d) {
			if (this.getAcceleration.getX > 0) {
				this.getAcceleration.add(-100, 0);
			}
		}
	}
	upvelocityAccordingToMovementKeyStates() {
		if (this.getMovementKeysStates.w) {
			this.setVelocity(this.getVelocity.getX, -10 * this.velocityMultiplier);
		}
		if (this.getMovementKeysStates.a) {
			this.setVelocity(-10 * this.velocityMultiplier, this.getVelocity.getY);
		}
		if (this.getMovementKeysStates.s) {
			this.setVelocity(this.getVelocity.getX, 10 * this.velocityMultiplier);
		}
		if (this.getMovementKeysStates.d) {
			this.setVelocity(10 * this.velocityMultiplier, this.getVelocity.getY);
		}

		if (this.getVelocity.getX < 0) {
			this.directionFacing = -1;
		} else if (this.getVelocity.getX > 0) {
			this.directionFacing = 1;
		}
	}
	develocityAccordingToMovementKeyStates() {
		if (! this.getMovementKeysStates.w) {
			if (this.getVelocity.getY < 0) {
				this.getVelocity.add(0, 1 * this.velocityMultiplier);
			}
		}

		if (! this.getMovementKeysStates.a) {
			if (this.getVelocity.getX < 0) {
				this.getVelocity.add(1 * this.velocityMultiplier, 0);
			}
		}

		if (! this.getMovementKeysStates.s) {
			if (this.getVelocity.getY > 0) {
				this.getVelocity.add(0, -1 * this.velocityMultiplier);
			}
		}

		if (! this.getMovementKeysStates.d) {
			if (this.getVelocity.getX > 0) {
				this.getVelocity.add(-1 * this.velocityMultiplier, 0);
			}
		}
	}
	stopDrift() {
		// -5 < x <= 5
		// x > -5
		// x <= 5
		if (!this.getMovementKeysStates.w && !this.getMovementKeysStates.s) {
			if (this.getVelocity.getY > -5 && this.getVelocity.getY <= 5) {
				this.getVelocity.setY(0);
			}
		}

		if (!this.getMovementKeysStates.a && !this.getMovementKeysStates.d) {
			if (this.getVelocity.getX > -5 && this.getVelocity.getX <= 5) {
				this.getVelocity.setX(0);
			}
		}
	}
}