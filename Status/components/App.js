function time(date = new Date()) {
	return date.getTime() / 1000;
}

/**
 * Add padding to the left of input
 * 
 * Example:
 * 
 * + 21 with length 3: 021
 * + "sample" with length 8: "  sample"
 *
 * @param	{string/number}		input Input
 * @param	{number}			length Length
 */
function pleft(inp, length = 0, right = false) {
	let type = typeof inp;
	let padd = "";

	inp = (type === "number") ? inp.toString() : inp;

	switch (type) {
		case "number":
			padd = "0";
			break;

		case "string":
			padd = " ";
			break;

		default:
			console.error(`error: pleft() first arg is ${type}`);
			return false;
	}

	padd = padd.repeat(Math.max(0, length - inp.length));
	return (right) ? inp + padd : padd + inp;
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
	OutCubic: t => (--t)*t*t + 1,

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
	},

	OutCirc: t => Math.sqrt(1 - Math.pow(t - 1, 2))
}

function parseTime(t = 0, {
	msDigit = 3,
	showPlus = false
} = {}) {
	let d = showPlus ? "+" : "";
	
	if (t < 0) {
		t = -t;
		d = "-";
	}
	
	let h = Math.floor(t / 3600);
	let m = Math.floor(t % 3600 / 60);
	let s = Math.floor(t % 3600 % 60);
	let ms = pleft(parseInt(t.toFixed(msDigit).split(".")[1]), msDigit);

	return {
		h: h,
		m: m,
		s: s,
		ms: ms
	}
}

const spinRing = {
	initialized: false,

	/**
	 * @type {HTMLCanvasElement}
	 */
	canvas: null,

	/**
	 * @type {CanvasRenderingContext2D}
	 */
	ctx: null,

	startTime: null,

	lineCount: 48,
	distance: 220,
	padAngle: 0.5,
	width: 3,
	color: "white",

	angle: 0,

	rotate: 0,
	targetRotate: 65,
	rotateDuration: 1.2,

	startTurnDuration: 80,
	fullTurnDuration: 100,
	turnDuration: 60,

	doUpdate: false,

	init() {
		this.canvas = document.getElementById("spinRing");
		this.ctx = this.canvas.getContext("2d");
		this.initialized = true;

		this.draw();
	},

	reset() {
		this.startTime = null;
		this.angle = 0;
		this.rotate = 0;
		this.turnDuration = 60;
		this.doUpdate = false;
		this.draw();
	},

	start() {
		this.doUpdate = true;
		this.update();
	},

	update() {
		if (!this.doUpdate)
			return;

		if (getComputedStyle(this.canvas).visibility === "visible") {
			let t = time();
	
			if (!this.startTime)
				this.startTime = t;
	
			let rPoint = (t - this.startTime) / this.rotateDuration;
			if (rPoint <= 1) {
				this.rotate = this.targetRotate * Easing.OutCirc(rPoint);
				this.turnDuration = this.startTurnDuration + (this.fullTurnDuration - this.startTurnDuration) * rPoint;
			}
	
			// Rotate Point
			let tPoint = (t - this.startTime) / this.turnDuration;
			this.angle = (Math.PI * 2) * tPoint;
			
			this.draw();
		}

		requestAnimationFrame(() => this.update());
	},

	center({
		x: x1 = 0,
		y: y1 = 0
	} = {}, {
		x: x2 = this.canvas.width,
		y: y2 = this.canvas.height
	} = {}) {
		return {
			x: (x2 + x1) / 2,
			y: (y2 + y1) / 2
		}
	},

	d2r(d) {
		return d * (Math.PI / 180);
	},

	rotatePoint({ x: xo, y: yo } = {}, { x, y } = {}, angle = 0) {
		let as = Math.sin(angle);
		let ac = Math.cos(angle);

		return {
			x: xo + ac * (x - xo) - as * (y - yo),
			y: yo + as * (x - xo) + ac * (y - yo)
		}
	},

	line(start = { x: 0, y: 0 }, end = { x: 0, y: 0 }, angle = 0) {
		if (angle !== 0) {
			let c = this.center(start, end);
			start = this.rotatePoint(c, start, angle);
			end = this.rotatePoint(c, end, angle);
		}

		this.ctx.beginPath();
		this.ctx.lineWidth = this.width;
		this.ctx.strokeStyle = this.color;
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);
		this.ctx.stroke();
	},

	calcPos(angle, distance, { x = 0, y = 0 } = {}) {
		return {
			x: x + (distance * Math.cos(angle)),
			y: y + (distance * Math.sin(angle))
		}
	},

	draw() {
		//? Clear Canvas For Redraw
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		let c = this.center();
		let angle = (Math.PI * 2) / this.lineCount;

		for (let i = 1; i <= this.lineCount; i++) {
			// First point of line
			let pp = this.calcPos(this.angle - this.d2r(this.padAngle) + (angle * i), this.distance, c);

			// Last point of line
			let pc = this.calcPos(this.angle + this.d2r(this.padAngle) + (angle * (i + 1)), this.distance, c);
			this.line(pp, pc, this.d2r(this.rotate));
		}
	}
}

function delayAsync(time) {
	return new Promise((resolve, reject) => {
		setTimeout(e => {
			resolve();
		}, time);
	});
}

function nextFrameAsync() {
	return new Promise((resolve, reject) => {
		requestAnimationFrame(() =>  resolve());
	});
}

const rawStatus = {
	0: "MainMenu",
	1: "EditingMap",
	2: "Playing",
	3: "SYSTEM OFFLINE",
	4: "SongSelectEdit",
	5: "SongSelect",
	7: "ResultsScreen",
	8: "Watching",
	10: "GameStartupAnimation",
	11: "MultiplayerRooms",
	12: "MultiplayerRoom",
	13: "MultiplayerSongSelect",
	14: "MultiplayerResultsscreen",
	15: "OsuDirect",
	16: "Editing",
	17: "RankingTagCoop",
	18: "RankingTeam",
	19: "ProcessingBeatmaps",
	22: "Tourney",
	32: "ResultsScreen",
	"-1": "SYSTEM OFFLINE",
	"-2": "Unknown"
}

const scene = {
	initialized: false,
	startTime: null,
	tickTime: null,
	runClock: false,
	statusQueue: [],
	handingStatus: false,
	spinnerReseted: false,

	playedIntro1: false,
	playingIntro1: false,

	playedIntro2: false,
	playingIntro2: false,

	/**
	 * @type {HTMLDivElement}
	 */
	mainContainer: null,

	/**
	 * @type {HTMLDivElement}
	 */
	topText: null,

	/**
	 * @type {HTMLDivElement}
	 */
	bottomText: null,

	/**
	 * @type {SVGCircleElement}
	 */
	spinner: null,

	/**
	 * @type {HTMLDivElement}
	 */
	clockD: null,

	/**
	 * @type {HTMLDivElement}
	 */
	clockT: null,

	/**
	 * @type {HTMLDivElement}
	 */
	clockMS: null,

	init() {
		this.mainContainer = document.querySelector("#app > .main");
		this.topText = document.querySelector("#app > .main > .middleText > .top");
		this.bottomText = document.querySelector("#app > .main > .middleText > .bottom");
		this.spinner = document.querySelector("#app > .main > .clockSpinner > svg > circle");
		this.clockD = document.querySelector("#app > .main > .clock > .timeD");
		this.clockT = document.querySelector("#app > .main > .clock > .time");
		this.clockMS = document.querySelector("#app > .main > .clock > .ms");

		spinRing.init();
		this.initialized = true;
		this.topText.innerText = "SYSTEM OFFLINE";

		this.statusHandler();
	},

	updateStatus(s) {
		if (!this.initialized)
			return;

		this.statusQueue.push(s);
		this.statusHandler();
	},

	async statusHandler() {
		if (this.statusQueue.length == 0 || this.handingStatus)
			return;

		this.handingStatus = true;
		let s = this.statusQueue[0]
		console.log(s);

		if (typeof s === "string") {
			if (s === "SYSTEM OFFLINE") {
				this.__rsIntro1();
				this.__rsIntro2();
				this.mainContainer.classList.remove("show1", "show2", "showRing", "showSpinner", "showBG");
				this.playedIntro = false;
				this.topText.innerText = "SYSTEM OFFLINE";
			} else {
				if (!this.playedIntro1) {
					await this.__intro1();

					if (s === "MainMenu") {
						await this.__intro2();
						this.mainContainer.classList.add("showBG");
					} else
						this.mainContainer.classList.remove("showBG");
				}
	
				switch (s) {
					case "MainMenu":
						this.mainContainer.classList.add("showBG");
						await this.__intro2();
						break;
	
					default:
						this.mainContainer.classList.remove("showBG");
						this.__rsIntro2();
						break;
				}
			}
		}

		this.statusQueue.splice(0, 1);
		this.handingStatus = false;
		this.statusHandler();
	},

	updateClock() {
		if (!this.runClock)
			return;

		let ct = time();

		if (!this.startTime) {
			this.startTime = ct;
			this.tickTime = this.startTime;
			this.tick();
		}

		let t = parseTime(ct - this.startTime);
		this.clockT.innerText = ((ct - this.startTime) >= 60)
			? `${t.h > 0 ? `${t.h}:` : ""}${t.m}:${pleft(t.s, 2)}`
			: t.s;

		this.clockMS.innerText = (t.ms < 50 || (t.ms > 500 && t.ms < 550))
			? `- ${t.ms} - `
			: t.ms;

		if (ct - this.tickTime >= 1) {
			this.tickTime = ct;
			this.tick();
		}

		requestAnimationFrame(() => this.updateClock());
	},

	stopClock() {
		this.runClock = false;
	},

	startClock() {
		this.runClock = true;
		this.updateClock();
	},

	async tick() {
		if (!this.spinnerReseted) {
			this.spinner.style.animation = "none";
			await nextFrameAsync();
			this.spinner.style.animation = null;
			this.spinnerReseted = true;
		}
	},

	async __intro1() {
		if (this.playedIntro1 || this.playingIntro1)
			return;

		this.topText.innerText = "Standing By";
		this.bottomText.innerText = "System Startup";
		await delayAsync(2000);
		
		this.topText.innerText = "";
		this.bottomText.innerText = "";
		await delayAsync(500);

		this.topText.innerText = "LiveStream";
		await delayAsync(100);

		this.topText.innerText = "System Startup";
		await delayAsync(500);

		this.bottomText.innerText = "CHECK / init";
		await delayAsync(300);

		this.bottomText.innerText = "RING_SPINNER / init";
		await delayAsync(1000);

		this.bottomText.innerText = "SCENE / init";
		await delayAsync(100);

		this.bottomText.innerText = "SCENE / setup layout";
		await delayAsync(50);

		this.bottomText.innerText = "SCENE / setup layout 60%";
		await delayAsync(50);

		this.bottomText.innerText = "SCENE / setup layout 99%";
		await delayAsync(100);

		this.bottomText.innerText = "SCENE / setup layout 100%";
		await delayAsync(50);

		this.bottomText.innerText = "SCENE / setup scene_frame_1";
		this.mainContainer.classList.add("show1");
		await delayAsync(500);

		this.topText.innerText = this.bottomText.innerText = "";
		this.mainContainer.classList.add("show2");

		this.playingIntro1 = false;
		this.playedIntro1 = true;
	},

	__rsIntro1() {
		if (!this.playedIntro1 || this.playingIntro1)
			return;

		this.mainContainer.classList.remove("show1", "show2");
		this.topText.innerText = this.bottomText.innerText = "";
		this.playedIntro1 = false;
	},

	async __intro2() {
		if (this.playedIntro2 || this.playingIntro2)
			return;

		this.playingIntro2 = true;
		this.topText.innerText = "System Startup";
		this.bottomText.innerText = "SCENE / setup scene_frame_2";
		this.mainContainer.classList.add("showRing");
		await delayAsync(100);

		this.bottomText.innerText = "SCENE / setup scene_ring";
		await delayAsync(500);

		this.topText.innerText = "PREP COUNTDOWN";
		this.bottomText.innerText = "";
		spinRing.start();
		await delayAsync(50);

		this.topText.innerText = "CHECK COUNTDOWN";
		await delayAsync(50);

		this.topText.innerText = "COUNTDOWN START";
		await delayAsync(500);

		this.topText.innerText = "";
		this.clockD.innerText = "CLR";
		await delayAsync(100);

		this.clockD.innerText = "";
		await delayAsync(50);

		this.clockD.innerText = "CLR";
		await delayAsync(50);

		this.clockD.innerText = "";
		await delayAsync(50);

		this.clockD.innerText = "88:88";
		await delayAsync(150);

		this.clockD.innerText = "88:80";
		await delayAsync(150);

		this.clockD.innerText = "88:00";
		await delayAsync(150);

		this.clockD.innerText = "80:00";
		await delayAsync(150);

		this.clockD.innerText = "00:00";
		await delayAsync(800);

		this.clockD.innerText = "";
		await delayAsync(80);

		this.clockD.innerText = "00:00";
		this.clockD.style.fontSize = "28px";
		await delayAsync(80);

		this.clockD.innerText = "";
		this.clockD.style.fontSize = null;
		await delayAsync(80);

		this.mainContainer.classList.add("showSpinner");
		this.startClock();

		this.playingIntro2 = false;
		this.playedIntro2 = true;
	},

	__rsIntro2() {
		if (!this.playedIntro2 || this.playingIntro2)
			return;

		this.stopClock();
		spinRing.reset();
		this.mainContainer.classList.remove("showRing", "showSpinner");
		this.clockD.innerText = this.clockT.innerText = this.clockMS.innerText = "";
		this.spinnerReseted = false;
		this.playedIntro2 = false;
	},
}

const app = {
	name: 'App',
	components: {},

	/**
	 * @type {HTMLDivElement}
	 */
	mainContainer: null,

	setup(props, context) {
		const data = Vue.reactive({
			tokens: {},
			rws: {}
		});

		const getToken = (tokenName, decimalPlaces) => _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);

		// either request all tokens upfront by filling their names in array
		// or request them later using helper getToken method above
		data.rws = watchTokens([], (values) => Object.assign(data.tokens, values));

		let currentStatus = Vue.computed(() => {
			let s = getToken("rawStatus");
			s = rawStatus[getToken("osuIsRunning")
				? ((s < 0 || s === 3 ? 0 : getToken("rawStatus")))
				: "-1"];

			scene.updateStatus(s);
			return s;
		});

		return {
			getToken,
			data,
			currentStatus
		}
	},

	mounted() {
		scene.init();
	}
}

export default app;
