
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

function delayAsync(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), time);
	});
}

function nextFrameAsync() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() =>  resolve());
	});
}

/**
 * Implements a fixed-length queue (circular buffer) to calculate the moving average
 * of the last N numbers.
 */
class MovingAverage {
	/**
	 * Creates an instance of MovingAverage.
	 * 
	 * @param	{number}	[size=10]	The maximum number of elements to store in the queue.
	 */
	constructor(size = 10) {
		this.size = size;
		this.queueArray = new Array(size).fill(0);
		this.head = 0;
		this.currentSum = 0;
		this.count = 0;
	}

	/**
	 * Adds a new number to the queue and updates the sum.
	 * When the queue is full, it overwrites the oldest element.
	 * 
	 * @param	{number}	newNumber	The number to add.
	 */
	addNumber(newNumber) {
		if (this.count === this.size) {
			this.currentSum -= this.queueArray[this.head];
		} else {
			this.count++;
		}

		this.currentSum += newNumber;
		this.queueArray[this.head] = newNumber;
		this.head = (this.head + 1) % this.size;
	}

	/**
	 * Resets the moving average calculator to its initial empty state.
	 * All stored numbers are cleared, and the sum and count are reset to zero.
	 */
	clear() {
		this.queueArray.fill(0);
		this.head = 0;
		this.currentSum = 0;
		this.count = 0;
	}

	/**
	 * Calculates and returns the current average of the numbers in the queue.
	 * Returns 0 if the queue is empty.
	 * 
	 * @returns		{number}	The average of the numbers in the queue.
	 */
	getAverage() {
		if (this.count === 0)
			return 0;

		return this.currentSum / this.count;
	}

	/**
	 * Returns the current state of the underlying queue array (for debugging/inspection).
	 * 
	 * @returns		{number[]}	A copy of the underlying array representing the queue.
	 */
	getQueue() {
		return [...this.queueArray];
	}

	/**
	 * Returns the current number of valid elements in the queue.
	 * 
	 * @returns		{number}	The count of valid elements.
	 */
	getCount() {
		return this.count;
	}
}

/**
 * A class to calculate mean and standard deviation incrementally using Welford's online algorithm.
 * This is efficient for adding numbers one by one to a growing dataset.
 */
class StandardDeviationCalculator {
	/**
	 * Creates an instance of StandardDeviationCalculator.
	 * 
	 * @param	{boolean}	[isSample=true]		Whether to calculate sample standard deviation (n-1 denominator) or population (n denominator).
	 */
	constructor(isSample = true) {
		this.isSample = isSample;
		this.clear();
	}

	/**
	 * Resets the calculator to its initial empty state.
	 */
	clear() {
		this.count = 0;
		this.mean = 0;
		this.M2 = 0;
	}

	/**
	 * Adds a new number to the dataset and updates the statistics.
	 * 
	 * @param	{number}	newNumber	The number to add.
	 */
	addNumber(newNumber) {
		this.count++;
		const delta = newNumber - this.mean;
		this.mean += delta / this.count;
		const delta2 = newNumber - this.mean;
		this.M2 += delta * delta2;
	}

	/**
	 * Gets the current count of numbers added.
	 * 
	 * @returns {number} The count.
	 */
	getCount() {
		return this.count;
	}

	/**
	 * Gets the current mean (average) of the numbers added.
	 * 
	 * @returns {number} The mean. Returns 0 if no numbers added.
	 */
	getMean() {
		return this.mean;
	}

	/**
	 * Calculates and returns the current variance of the numbers added.
	 * 
	 * @returns {number} The variance. Returns 0 if insufficient data.
	 */
	getVariance() {
		if (this.count < (this.isSample ? 2 : 1)) {
			return 0;
		}

		const divisor = this.isSample ? (this.count - 1) : this.count;
		return this.M2 / divisor;
	}

	/**
	 * Calculates and returns the current standard deviation of the numbers added.
	 * 
	 * @returns {number} The standard deviation. Returns 0 if insufficient data.
	 */
	getStandardDeviation() {
		return Math.sqrt(this.getVariance());
	}
}

const Easing = {
	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	Linear: t => t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InSine: t => 1 - Math.cos((t * Math.PI) / 2),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutSine: t => Math.sin((t * Math.PI) / 2),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InQuad: t => t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutQuad: t => t*(2-t),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutQuad: t => (t < .5) ? 2*t*t : -1+(4-2*t)*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InCubic: t => t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutCubic: t => (--t)*t*t+1,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutCubic: t => (t < .5) ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutExpo: t => t === 0
				? 0
				: t === 1
					? 1
					: t < 0.5
						? Math.pow(2, 20 * t - 10) / 2
						: (2 - Math.pow(2, -20 * t + 10)) / 2,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InQuart: t => t*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutQuart: t => 1-(--t)*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutQuart: t => (t < .5) ? 8*t*t*t*t : 1-8*(--t)*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InQuint: t => t*t*t*t*t,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutQuint: t => 1 - Math.pow(1 - t, 5),

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InOutQuint: t => (t < 0.5) ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	InElastic: t => {
		const c4 = (2 * Math.PI) / 3;

		return t === 0
			? 0
			: t === 1
				? 1
				: -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
	},

	/**
	 * @param	{Number}	t	Point [0, 1]
	 * @return	{Number}		Point [0, 1]
	 */
	OutElastic: t => {
		const c4 = (2 * Math.PI) / 3;

		return t === 0
			? 0
			: t === 1
				? 1
				: Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	}
}

class Animator {
	/**
	 * Animate a value
	 *
	 * @param	{Number}		duration 			Animation Duration in Seconds
	 * @param	{Function}		timingFunction 		Animation Timing Function
	 * @param	{Function}		animate 			Function To Handle Animation
	 */
	constructor(duration, timingFunction, animate) {
		if (duration < 0) {
			clog("WARN", `Animator(): duration is a negative number! (${duration}s). This animation will be completed instantly.`);

			animate(1);
			return;
		}

		this.duration = duration * 1000;
		this.timingFunction = timingFunction;
		this.animate = animate;
		this.completed = false;
		this.cancelled = false;

		/** @type {Function[]} */
		this.completeHandlers = []

		this.start = performance.now();
		this.animationFrameID = requestAnimationFrame(() => this.update());
	}

	update() {
		if (this.completed || this.cancelled)
			return;

		let tPoint = (performance.now() - this.start) / this.duration;

		// Safe executing update function to prevent stopping
		// animation entirely
		try {
			if (this.animate(Math.min(this.timingFunction(tPoint), 1)) === false)
				// Stop Animator
				tPoint = 1.1;
		} catch (e) {
			let error = parseException(e);
			clog("WARN", `Animator().update(): [${error.code}] ${error.description}`);
		}

		if (tPoint <= 1)
			this.animationFrameID = requestAnimationFrame(() => this.update());
		else {
			this.animate(1);
			this.completed = true;

			for (let f of this.completeHandlers) {
				try {
					f(true);
				} catch(e) {
					clog("WARN", `Animator().update(): an error occured while handing complete handlers`, e);
					continue;
				}
			}
		}
	}

	cancel() {
		if (this.completed || this.cancelled)
			return;

		cancelAnimationFrame(this.animationFrameID);
		this.cancelled = true;

		for (let f of this.completeHandlers) {
			try {
				f(false);
			} catch(e) {
				clog("WARN", `Animator().cancel(): an error occured while handing complete handlers`, e);
				continue;
			}
		}
	}

	/**
	 * Wait for animation to complete.
	 * @returns {Promise<Boolean>} true if animation completed, false if cancelled
	 */
	complete() {
		return new Promise((resolve) => {
			if (this.completed)
				resolve(true);

			this.onComplete((completed) => resolve(completed));
		});
	}

	/**
	 * Animation complete handler
	 * @param	{(completed: Boolean) => any}	f
	 */
	onComplete(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "Animator().onComplete(): not a valid function" }

		this.completeHandlers.push(f);
	}
}

class SmoothValue {
	/**
	 * Create a new smooth value element.
	 *
	 * @param	{object}				options
	 * @param	{string|string[]}		options.classes
	 * @param	{number}				options.duration	Animation duration, in seconds.
	 * @param	{(number) => number}	options.timing		Timing functions, see {@link Easing}.
	 * @param	{number}				[options.decimal]	Amount of decimal numbers to display
	 */
	constructor({
		classes = [],
		duration = 1,
		timing = Easing.OutExpo,
		decimal = 0
	} = {}) {
		if (typeof classes === "string")
			classes = [classes];

		this.container = document.createElement("span");
		this.container.classList.add("smooth-value", ...classes);

		this.duration = duration;
		this.timing = timing;
		this.decimal = decimal;

		/** @type {Animator} */
		this.animator = null;

		this.currentValue = 0;
		this.container.innerText = this.currentValue.toFixed(this.decimal);
	}

	set value(value) {
		this.set(value);
	}

	async set(value) {
		if (this.animator) {
			this.animator.cancel();
			this.animator = null;
		}

		if (this.currentValue === value)
			return this;

		let start = this.currentValue;
		let delta = (value - this.currentValue);

		this.animator = new Animator(this.duration, this.timing, (t) => {
			this.currentValue = start + (delta * t);
			this.container.innerText = this.currentValue.toFixed(this.decimal);
		});

		await this.animator.complete();
		return this;
	}
}
