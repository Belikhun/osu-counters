
function odToMs(od) {
	return {
		hit300: (159 - 12 * od) / 2,
		hit100: (279 - 16 * od) / 2,
		hit50: (399 - 20 * od) / 2
	}
}

const app = {
	/** @type {WebSocketManager} */
	client: undefined,

	data: {
		common: {
			current: {},
			previous: {}
		},

		precise: {
			current: {},
			previous: {}
		},
	},

	/** @type {{ [channel: string]: { key: string, handler: (value: any) => void }[] }} */
	handlers: {
		common: [],
		precise: []
	},

	init() {
		this.client = new WebSocketManager(window.location.host);

		HitErrorChart.init(document.getElementById("hitErrorChart"));

		this.client.api_v2((data) => {
			this.dispatch(data, "common");
		});

		this.client.api_v2_precise((data) => {
			this.dispatch(data, "precise");
		});
	},

	/**
	 * Get value by key
	 * 
	 * @param	{string}	key
	 * @param	{any}		[defaultValue]
	 */
	get(key, defaultValue = null, store = this.data.common.current) {
		const path = key.split(".");
		let value = store;

		for (const token of path) {
			if (typeof value[token] == "undefined")
				return defaultValue;

			if ([value[token]] && typeof [value[token]] != "object")
				throw new Error(`Key ${key} is invalid`);

			value = value[token];
		}

		return value;
	},

	/**
	 * Subscribe for value change of the specified value key
	 * 
	 * @param	{string}				key
	 * @param	{(value: any) => void}	handler
	 * @param	{"common" | "precise"}	channel
	 */
	subscribe(key, handler, channel = "common") {
		this.handlers[channel].push({
			key,
			handler
		});

		return this;
	},

	isChanged(value1, value2) {
		// Can't efficiently compare objects yet.
		if (value1 && typeof value1 == "object")
			return true;

		return value1 != value2;
	},

	dispatch(data, channel = "common") {
		this.data[channel].previous = this.data[channel].current;
		this.data[channel].current = data;

		for (const { key, handler } of this.handlers[channel]) {
			let current = this.get(key, null, this.data[channel].current);
			let previous = this.get(key, null, this.data[channel].previous);

			if (!this.isChanged(current, previous))
				continue;

			try {
				handler(current);
			} catch (e) {
				console.warn(`Error occured while handing`)
			}
		}
	}
}

const HitErrorChart = {
	BAR_WIDTH: 2,
	BAR_SPACE: 2,

	/** @type {HTMLDivElement} */
	container: null,
	
	/** @type {HTMLDivElement} */
	barContainer: null,
	
	/** @type {HTMLDivElement} */
	hintContainer: null,
	
	debug: {
		/** @type {HTMLSpanElement} */
		ms: null,

		/** @type {HTMLSpanElement} */
		delta: null,

		/** @type {HTMLSpanElement} */
		updates: null,

		/** @type {HTMLSpanElement} */
		index: null,

		/** @type {HTMLSpanElement} */
		step: null,

		/** @type {HTMLSpanElement} */
		max: null
	},
	
	od: 6,
	cWidth: 0,

	/**
	 * @typedef		BarObject
	 * @type		{Object}
	 * @property	{HTMLDivElement}	bar
	 * @property	{Number}			ms
	 * @property	{Number}			value
	 * @property	{Number}			height
	 * @property	{Number}			from
	 * @property	{Number}			to
	 * @property	{Boolean}			updated
	 */
	
	/** @type {BarObject[]} */
	bars: [],
	index: 0,
	max: 0,
	msDelta: 0,
	step: 5,

	init(container) {
		this.container = container;
		this.barContainer = this.container.querySelector(":scope > .bars");
		this.hintContainer = this.container.querySelector(":scope > .hints");
		this.debug.ms = this.container.querySelector(":scope > .debugs > .ms");
		this.debug.delta = this.container.querySelector(":scope > .debugs > .delta");
		this.debug.updates = this.container.querySelector(":scope > .debugs > .updates");
		this.debug.index = this.container.querySelector(":scope > .debugs > .index");
		this.debug.step = this.container.querySelector(":scope > .debugs > .step");
		this.debug.max = this.container.querySelector(":scope > .debugs > .max");

		this.updateOD(this.od, true);

		const urValue = document.querySelector(`#unstableRate > .value`);

		app.subscribe("play.unstableRate", (value) => {
			urValue.innerText = value.toFixed(2);
		});

		app.subscribe("beatmap.stats.od.converted", (value) => {
			
		});

		app.subscribe("hitErrors", (value) => {
			this.updateHits(value);
		}, "precise");
	},

	/**
	 * Update OD and redraw all bars
	 * 
	 * @param {Number}	od
	 */
	updateOD(od, force = false) {
		if (od === this.od && !force)
			return;

		this.od = od;
		console.log("new od", od);

		if (!this.container)
			return;

		this.reset();

		let ms = odToMs(od);
		let width = ms.hit50 * 2;
		let bars = Math.floor((this.cWidth - this.BAR_SPACE) / (this.BAR_WIDTH + this.BAR_SPACE)) + 1;
		this.msDelta = width / bars;
		this.debug.delta.innerText = `Δ ` + this.msDelta.toFixed(3) + "ms";
		this.debug.ms.innerHTML = [
			`<span class="bl">${ms.hit300.toFixed(1)}</span>`,
			`<span class="gr">${ms.hit100.toFixed(1)}</span>`,
			`<span class="ye">${ms.hit50.toFixed(1)}</span>`
		].join("/");

		for (let i = 0; i < bars; i++) {
			let bar = document.createElement("div");
			let left = i * (this.BAR_WIDTH + this.BAR_SPACE);
			let msScale = scaleValue(left, [0, this.cWidth], [-(width / 2), (width / 2)]);

			let color = "blue";
			if (ms.hit100 < Math.abs(msScale))
				color = "yellow";
			else if (ms.hit300 < Math.abs(msScale))
				color = "green";

			bar.style.width = this.BAR_WIDTH + "px";
			bar.style.left = left + "px";
			bar.dataset.ms = msScale;
			bar.dataset.color = color;

			this.bars.push({
				bar,
				ms: msScale,
				value: 0,
				height: 0,
				from: msScale - (this.msDelta / 2),
				to: msScale + (this.msDelta / 2),
				updated: false
			});

			this.barContainer.appendChild(bar);
		}

		emptyNode(this.hintContainer);
		let hints = [-120, -90, -60, -30, 0, 30, 60, 90, 120]

		for (let i = 0; i < hints.length; i++) {
			let hint = hints[i];
			let hintItem = document.createElement("span");
			let left = scaleValue(hint, [-(width / 2), (width / 2)], [0, this.cWidth]);

			hintItem.innerText = (hint > 0) ? `+${hint}` : hint;
			hintItem.style.left = left + "px";
			hintItem.dataset.level = Math.abs(i - ((hints.length - 1) / 2));
			this.hintContainer.appendChild(hintItem);
		}

		console.log({ width, bars, msDelta: this.msDelta, ms });
	},

	reset() {
		console.log("reset");
		emptyNode(this.barContainer);
		this.bars = Array();
		this.index = 0;
		this.max = 0;
		this.cWidth = this.container.clientWidth;
	},

	render() {
		let step = Math.floor((this.max / 10) + 1) * 10;
		let updateAll = false;

		if (step !== this.step) {
			console.log("step", step, this.max);
			updateAll = true;
		}

		// Update bars
		let updated = 0;
		for (let bar of this.bars) {
			if (bar.updated && !updateAll)
				continue;
			
			bar.height = bar.value / step;
			bar.bar.style.height = `${bar.height * 100}%`;
			bar.updated = true;
			updated++;
		}

		this.debug.updates.innerText = `U ${updated}`;
		this.debug.index.innerText = `I ${this.index}`;
		this.debug.step.innerText = `${step} STP`;
		this.debug.max.innerText = `${this.max.toFixed(3)} MAX`;
		this.step = step;
	},

	/**
	 * Update hits
	 * 
	 * @param	{number[]}	hits
	 */
	updateHits(hits) {
		if ((hits.length - 1 === this.index) || this.bars.length === 0)
			return;

		// This indicate an map restart/replay. Reset all hits.
		if (hits.length - 1 < this.index) {
			for (let bar of this.bars) {
				bar.value = 0;
				bar.height = 0;
				bar.updated = false;
			}

			this.max = 0;
			this.index = 0;
		}

		let newHits = hits.slice(this.index);
		this.index = hits.length - 1;

		for (let hit of newHits) {
			for (let [i, bar] of this.bars.entries()) {
				if (hit <= bar.ms) {
					let pbar = this.bars[i - 1];

					if (!pbar) {
						bar.value += 1;
						bar.updated = false;

						if (bar.value > this.max)
							this.max = max;

						break;
					}

					let bInc = Math.abs(hit - bar.ms) / this.msDelta;
					let nbInc = Math.abs(hit - pbar.ms) / this.msDelta;

					bar.value += bInc;
					pbar.value += nbInc;
					bar.updated = false;
					pbar.updated = false;

					this.max = Math.max(this.max, bar.value, pbar.value);
					break;
				}
			}
		}

		this.render();
	}
}

app.init();
