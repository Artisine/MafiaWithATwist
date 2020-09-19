
import {Vector2} from "./vector2.js";

export let log_verbose = true;

export const alphabet = "abcdefghijklmnopqrstuvwxyz";
export const numbers = "0123456789";
export function createSnowflake() {
	let snowflake = "";

	const now = Date.now();
	const binaryNow = (now >>> 0).toString(2);
	const numberOfPreceedingZeroes = 42 - binaryNow.length;
	let zeroString = "";
	for (let i = 0; i < numberOfPreceedingZeroes; i += 1) {
		zeroString += "0";
	}
	const nowString = zeroString + binaryNow;

	const alphanumeric = alphabet + numbers;
	const alphanumericLength = alphanumeric.length;
	let alphanumericString = "";
	for (let i = 0; i < 22; i += 1) {
		alphanumericString += alphanumeric[Math.floor(alphanumericLength * Math.random())];
	}

	snowflake = nowString + alphanumericString;
	// console.log(snowflake);
	return snowflake;
};
export function generateID() {
	let output = "";
	let leng = alphabet.length;
	for (let i = 0; i < 8; i += 1) {
		output += alphabet[Math.floor(Math.random() * leng)];
	}
	return output;
}

export function getElement(query) {
	return document.querySelector(query);
};

export function g(query) {
	return getElement(query);
};


export function forceFloat(number) {
	return Number(number);
};

export function forceInteger(number) {
	return Math.round(number);
};

export function forceBoolean(val) {
	return (!! val);
};

export function Math_rad(deg) {
	return deg * (Math.PI / 180);
};
export function Math_deg(rad) {
	return rad * (180 / Math.PI);
};

export function distanceBetweenPoints(...args) {
	var valid = false;
	var ax, ay, bx, by;
	if (args.length === 2 && args.every(item => item instanceof Vector2)) {
		ax = args[0].getX;
		ay = args[0].getY;
		bx = args[1].getX;
		by = args[1].getY;
		valid = true;
	} else if (args.length === 4 && args.every(item => typeof item === "number")) {
		ax = args[0];
		ay = args[1];
		bx = args[2];
		by = args[3];
		valid = true;
	}
	if (valid) {
		return Math.abs(Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2));
	} else {
		return new Error("Provided parameters were invalid");
	}
}