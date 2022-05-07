
/**
 * @param	{String}	selector 
 * @returns {HTMLElement}
 */
function $(selector) {
	return document.querySelector(selector);
}

function scaleValue(value, from, to) {
	let scale = (to[1] - to[0]) / (from[1] - from[0]);
	let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
	return capped * scale + to[0];
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
 * Bar
 * @typedef		Bar
 * @type		{Object}
 * @property	{HTMLElement}	node
 * @property	{Number}		value
 * @property	{Number}		last
 */

const script = {
	heartNode: $("#heart"),
	bpmNode: $("#value"),

	graph: $("#graph"),
	linesNode: $("#graph > .lines"),
	timesNode: $("#graph > .times"),

	maxNode: $("#graph > .values > .max"),
	realMaxNode: $("#graph > .values > .realMax"),
	realMaxLine: $("#graph > .realMaxLine"),
	minNode: $("#graph > .values > .min"),
	cValNode: $("#graph > .values > .current"),

	updateTimeout: undefined,
	
	BAR_WIDTH: 6,
	BAR_SPACE: 2,

	min: 80,
	max: 80,
	realMax: 80,
	pos: 0,
	bpm: 0,

	/** @type {Bar[]} */
	bars: [],
	barNum: 0,

	init() {
		let width = this.graph.clientWidth;
		this.barNum = Math.floor((width - this.BAR_SPACE) / (this.BAR_WIDTH + this.BAR_SPACE)) + 1;
		this.bpm = this.min;

		this.maxNode.innerText = this.max;
		this.realMaxNode.innerText = this.realMax;
		this.minNode.innerText = this.min;

		this.graph.style.setProperty("--width", `${this.BAR_WIDTH}px`);
		this.graph.style.setProperty("--space", `${this.BAR_SPACE}px`);
		this.beater();
		this.updater();
	},

	now() {
		return performance.now() / 1000;
	},

	async beater() {
		while (true) {
			let time = (1 / (this.bpm / 60)) * 2;
			await this.beat(time);
		}
	},

	async beat(time) {
		this.heartNode.style.animationName = "none";
		this.heartNode.style.animationDuration = `${time}s`;
		this.heartNode.offsetTop;
		requestAnimationFrame(() => this.heartNode.style.animationName = null);
		await delayAsync(time * 1000);
	},

	async updater() {
		clearTimeout(this.updateTimeout);
		let start = this.now();

		try {
			await this.update();
		} catch(e) {
			console.error(e);
		}

		this.updateTimeout = setTimeout(
			() => this.updater(),
			(1 - (this.now() - start)) * 1000);
	},

	updateHeight(node, last, current) {
		let delta = Math.abs(last - current);

		node.style.bottom = scaleValue(
			Math.min(current, last),
			[this.min, this.max],
			[0, 100]) + "%";

		node.style.height = scaleValue(
			delta,
			[0, this.max - this.min],
			[0, 100]) + "%";

		if (delta > 0)
			node.classList.add("pad");
	},

	updateHeights() {
		console.log("update heights");

		for (let bar of this.bars)
			this.updateHeight(bar.node, bar.last, bar.value);
	},

	push(bpm) {
		let node = document.createElement("span");
		let reRender = false;

		if (bpm < this.min) {
			this.min = bpm;
			this.minNode.innerText = this.min;
			reRender = true;
		}

		if (bpm > this.max) {
			this.max = bpm + 10;
			this.maxNode.innerText = this.max;
			reRender = true;
		}

		if (bpm > this.realMax) {
			this.realMax = bpm;

			this.realMaxNode.innerText = this.realMax;
			this.realMaxNode.style.bottom = this.realMaxLine.style.bottom
				= scaleValue(this.realMax, [this.min, this.max], [0, 100]) + "%";
		}

		this.updateHeight(node, this.bpm, bpm);
		node.dataset.pos = this.pos;

		if (bpm === this.bpm)
			node.dataset.color = "gray";
		else if (bpm > this.bpm)
			node.dataset.color = "red";
		else
			node.dataset.color = "green";

		if (reRender)
			this.updateHeights();

		this.cValNode.innerText = bpm;
		this.cValNode.style.bottom = scaleValue(
			bpm,
			[this.min, this.max],
			[0, 100]) + "%";

		this.bars[this.pos] = { node, value: bpm, last: this.bpm }
		this.linesNode.appendChild(node);
		this.bpm = bpm;

		requestAnimationFrame(() => {
			node.classList.add("show");

			setTimeout(() => {
				// Update new pos
				this.pos += 1;

				if (this.pos > this.barNum)
					this.pos = 0;

				if (this.bars[this.pos]) {
					this.linesNode.removeChild(this.bars[this.pos].node);
					delete this.bars[this.pos];
				}
			}, 200);
		});
	},

	async update() {
		let value = await (await fetch(`/bpm`)).text();
		value = parseInt(value);

		if (!value)
			value = 0;

		this.bpmNode.innerText = value;
		this.push(value);
	}
}

window.addEventListener("load", () => script.init());