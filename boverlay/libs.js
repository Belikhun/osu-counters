
/**
 * Remove all childs in a Node
 * 
 * @param	{Element}	node	Node to empty
 */
function emptyNode(node) {
	while (node.firstChild)
		node.firstChild.remove();
}

/**
 * Insert a node after a node.
 * 
 * @param	{HTMLElement}	newNode
 * @param	{HTMLElement}	existingNode
 */
function insertAfter(newNode, existingNode) {
	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function time(date) {
	if (date instanceof Date)
		return date.getTime() / 1000;

	return Date.now() / 1000;
}

function parseTime(t = 0, {
	forceShowHours = false,
	msDigit = 3,
	showPlus = false,
	strVal = true,
	calcDays = false
} = {}) {
	const d = showPlus ? "+" : "";
	let days = 0;
	
	if (t < 0) {
		t = -t;
		d = "-";
	}

	if (calcDays) {
		days = Math.floor(t / 86400);
		t %= 86400;
	}
	
	const h = Math.floor(t / 3600);
	const m = Math.floor(t % 3600 / 60);
	const s = Math.floor(t % 3600 % 60);
	const ms = pleft(parseInt(t.toFixed(msDigit).split(".")[1]), msDigit);

	return {
		h, m, s, ms, d,
		days,
		str: (strVal)
			? d + [h, m, s]
				.map(v => v < 10 ? "0" + v : v)
				.filter((v, i) => i > 0 || forceShowHours || v !== "00")
				.join(":")
			: null
	}
}

function convertSize(bytes) {
	let sizes = ["B", "KB", "MB", "GB", "TB"];
	for (var i = 0; bytes >= 1024 && i < (sizes.length -1 ); i++)
		bytes /= 1024;

	return `${round(bytes, 2)} ${sizes[i]}`;
}

function round(number, to = 2) {
	const d = Math.pow(10, to);
	return Math.round(number * d) / d;
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param		{Number}	value	The input value
 * @param		{Number}	min		The lower boundary of the output range
 * @param		{Number}	max		The upper boundary of the output range
 * @returns		{Number}	A number in the range [min, max]
 */
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

/**
 * Scale value from range [a, b] to [c, d]
 * 
 * @param	{Number}		value		Value to scale
 * @param	{Number[]}		from		Contain 2 points of input value range. Ex: [0, 1]
 * @param	{Number[]}		to			Target scale range of input value. Ex: [50, 100]
 * @returns	{Number}		Scaled value
 */
function scaleValue(value, from, to) {
	let scale = (to[1] - to[0]) / (from[1] - from[0]);
	let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
	return capped * scale + to[0];
}

/**
 * Generate Random Number
 * 
 * @param	{Number}		min		Minimum Random Number
 * @param	{Number}		max		Maximum Random Number
 * @param	{Boolean}		toInt	Return an Integer Value
 * @returns	{Number}
 */
function randBetween(min, max, toInt = true) {
	return toInt
		? Math.floor(Math.random() * (max - min + 1) + min)
		: (Math.random() * (max - min) + min)
}

/**
 * Generate Random String
 * 
 * @param	{Number}	len			Length of the randomized string
 * @param	{String}	charSet
 * @returns	{String}
 */
function randString(len = 16, charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
	let randomString = "";

	for (let i = 0; i < len; i++) {
		let p = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(p, p + 1);
	}

	return randomString;
}

/**
 * Pick a random item in an Array
 * 
 * @template	T
 * @param		{T[]}	array
 * @returns		{T}
 */
function randItem(array) {
	if (typeof array.length !== "number")
		throw { code: -1, description: `randItem(): not a valid array` }

	return array[randBetween(0, array.length - 1, true)];
}
