
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
	container: $("#bpm"),
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

	recordMaxNode: $("#recordMax"),
	recordMinNode: $("#recordMin"),

	updateTimeout: undefined,
	
	BAR_WIDTH: 6,
	BAR_SPACE: 2,

	lost: false,
	min: 90,
	max: 100,
	realMax: 90,
	recordMax: 0,
	recordMin: 9999,
	pos: 0,
	bpm: -1,
	lastBPM: 0,

	/** @type {Bar[]} */
	bars: [],
	barNum: 0,

	init() {
		let width = this.graph.clientWidth;
		this.barNum = Math.floor((width - this.BAR_SPACE) / (this.BAR_WIDTH + this.BAR_SPACE)) + 1;
		this.lastBPM = this.min;

		this.maxNode.innerText = this.max;
		this.realMaxNode.innerText = this.realMax;
		this.minNode.innerText = this.min;
		this.recordMaxNode.innerText = `MAX ${this.realMax}`;
		this.recordMinNode.innerText = `MIN ${this.min}`;

		this.graph.style.setProperty("--width", `${this.BAR_WIDTH}px`);
		this.graph.style.setProperty("--space", `${this.BAR_SPACE}px`);
		this.beater();
		this.updater();

		setInterval(() => {
			if (!this.bpm || this.bpm < 0)
				return;

			this.bpmNode.innerText = this.bpm;
			this.push(this.bpm);
		}, 1000);
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
			(0.5 - (this.now() - start)) * 1000);
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

		for (let bar of this.bars) {
			// Skip deleted bar.
			if (!bar)
				continue;

			this.updateHeight(bar.node, bar.last, bar.value);
		}

		this.realMaxNode.style.bottom = this.realMaxLine.style.bottom
			= scaleValue(this.realMax, [this.min, this.max], [0, 100]) + "%";
	},

	updateMin() {
		this.min = Math.min(...this.bars.filter(i => i.last > 0).map(i => i.last));
		console.log("update min", this.min);
		this.minNode.innerText = this.min;
	},

	updateMax() {
		this.realMax = Math.max(...this.bars.filter(i => i.value > 0).map(i => i.value));
		console.log("update max", this.realMax);
		this.max = this.realMax + 10;
		this.realMaxNode.innerText = this.realMax;
		this.maxNode.innerText = this.max;
	},

	push(bpm) {
		let node = document.createElement("span");
		let reRender = false;

		if (bpm < this.min) {
			this.min = bpm;
			this.minNode.innerText = this.min;
			reRender = true;
		}

		if (bpm < this.recordMin) {
			this.recordMin = bpm;
			this.recordMinNode.innerText = `MIN ${this.recordMin}`;
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

		if (bpm > this.recordMax) {
			this.recordMax = bpm;
			this.recordMaxNode.innerText = `MAX ${this.recordMax}`;
		}

		this.updateHeight(node, this.lastBPM, bpm);
		node.dataset.pos = this.pos;

		if (bpm === this.lastBPM)
			node.dataset.color = "gray";
		else if (bpm > this.lastBPM)
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

		this.bars[this.pos] = { node, value: bpm, last: this.lastBPM }
		this.linesNode.appendChild(node);
		this.lastBPM = bpm;

		requestAnimationFrame(() => {
			node.classList.add("show");

			setTimeout(() => {
				// Update new pos
				this.pos += 1;

				if (this.pos > this.barNum)
					this.pos = 0;

				if (this.bars[this.pos]) {
					let last = this.bars[this.pos].last;
					let reupdate = false;

					this.linesNode.removeChild(this.bars[this.pos].node);
					delete this.bars[this.pos];

					if (last >= this.realMax) {
						reupdate = true;
						this.updateMax();
					}

					if (last <= this.min) {
						reupdate = true;
						this.updateMin();
					}

					if (reupdate)
						this.updateHeights();
				}
			}, 200);
		});
	},

	async update() {
		let value = await (await fetch(`/bpm`)).text();
		value = parseInt(value);

		if (!value || value < 0) {
			this.bpmNode.innerText = "BPM";
			this.container.classList.add("lost");
			this.bpm = -1;
			this.lost = true;
			return;
		}

		if (this.lost)
			this.container.classList.remove("lost");

		this.lost = false;
		this.bpm = value;
	}
}

window.addEventListener("load", () => script.init());