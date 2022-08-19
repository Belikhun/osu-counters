const rawStatus = {
	0: "MainMenu",
	1: "EditingMap",
	2: "Playing",
	3: "NotRunning",
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
	"-1": "NotRunning",
	"-2": "Unknown"
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
	 * @param {Number}		duration 			Animation Duration in Seconds
	 * @param {Function}	timingFunction 		Animation Timing Function
	 * @param {Function}	animate 			Function To Handle Animation
	 */
	constructor(duration, timingFunction, animate) {
		if (duration < 0) {
			clog("WARN", `Animator(): duration is a negative number! (${duration}s). This animation will be completed instantly.`);

			animate(1);
			return;
		}

		this.duration = duration;
		this.timingFunction = timingFunction;
		this.animate = animate;

		/** @type {Function[]} */
		this.completeHandlers = []

		this.start = performance.now() / 1000;
		this.animationFrameID = requestAnimationFrame(() => this.update());
	}

	update() {
		let tPoint = ((performance.now() / 1000) - this.start) / this.duration;

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
			this.completeHandlers.forEach(f => f());
		}
	}

	cancel() {
		cancelAnimationFrame(this.animationFrameID);
	}

	/**
	 * Animation complete handler
	 * @param	{Function}	f
	 */
	onComplete(f) {
		if (!f || typeof f !== "function")
			throw { code: -1, description: "Animator().onComplete(): not a valid function" }

		this.completeHandlers.push(f);
	}
}

function scaleValue(value, from, to) {
	let scale = (to[1] - to[0]) / (from[1] - from[0]);
	let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
	return capped * scale + to[0];
}

const app = {
	name: 'App',
	components: {},

	setup(props, context) {
		const data = Vue.reactive({
			tokens: {},
			rws: {}
		});

		const getToken = (tokenName, decimalPlaces) => _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);

		// either request all tokens upfront by filling their names in array
		// or request them later using helper getToken method above
		data.rws = watchTokens(["od", "hitErrors"], (values) => {
			Object.assign(data.tokens, values);
		});

		let currentStatus = Vue.computed(() => {
			let s = getToken("rawStatus");

			return rawStatus[
				getToken("osuIsRunning")
					? ((s < 0 || s === 3 ? 0 : getToken("rawStatus")))
					: "-1"
			]
		});
		
		let grade = Vue.computed(() => ["XX", "X", "SS", "S", "A", "B", "C", "D", "F", "?"][getToken('grade')]);

		let gradeStyle = Vue.computed(() => {
			let g = getToken('grade');

			if (g === 0 || g === 1)
				return "whitesmoke";
			else if (g === 2 || g === 3)
				return "yellow";
			else if (g === 4)
				return "green";
			else if (g === 5)
				return "blue";
			else if (g === 6 || g == 7)
				return "red";
			else
				return "gray";
		});

		let isPlayingOrWatching = Vue.computed(() =>
			_IsInStatus(data.rws, data.tokens, [
				window.overlay.osuStatus.Playing,
				window.overlay.osuStatus.ResultsScreen,
				window.overlay.osuStatus.Watching
			])
		);

		let isMania = Vue.computed(() => getToken('gameMode') === 'OsuMania');
		let showIfInPlayingField = Vue.computed(() => [2, 8].includes(getToken("rawStatus")) ? "show" : "hide");
		let hideIfPlaying = Vue.computed(() => isPlayingOrWatching.value ? "hide" : "show");
		let showIfPlaying = Vue.computed(() => !isPlayingOrWatching.value ? "hide" : "show");

		/** @type {HTMLElement} */
		let accBarLeft;
		/** @type {HTMLElement} */
		let accBarRight;

		let accBarCurrent, accBarReal;
		/** @type {Animator} */
		let accAnimator = null;
		let lastAcc = 0;
		let currentAcc = 0;
		let currentAccBarValue = 0;

		let realAcc = Vue.computed(() => {
			let realAcc = isMania.value
				? (300 * (getToken("geki") + getToken("c300")) + 200 * getToken("katsu") + 100 * getToken("c100") + 50 * getToken("c50"))
					/ (300 * (getToken("circles") + getToken("sliders")))
				: (300 * getToken("c300") + 100 * getToken("c100") + 50 * getToken("c50"))
					/ (300 * (getToken("circles") + getToken("sliders")));

			if (accBarReal)
				accBarReal.style.width = `${realAcc * 100}%`;

			return (realAcc * 100).toFixed(2);
		});

		let accValue = Vue.computed(() => {
			currentAcc = getToken("acc");

			if (!currentAcc)
				currentAcc = 100;

			if (accBarCurrent)
				accBarCurrent.style.width = `${currentAcc}%`;

			return currentAcc.toFixed(2);
		});

		Vue.onMounted(() => {
			accBarLeft = document.getElementById("accBarLeft");
			accBarRight = document.getElementById("accBarRight");

			setInterval(() => {
				let m = 0.05;
				let lv = currentAccBarValue;
				let d = (currentAcc - lastAcc);

				let p = scaleValue(Math.abs(d), [0, m], [0, 50]);
				let newAV = (d > 0) ? p : -p;

				if (newAV - lv === 0) {
					accBarLeft.style.width = "0";
					accBarRight.style.width = "0";
					return;
				}
				
				if (accAnimator) {
					accAnimator.cancel();
					accAnimator = null;
				}

				accAnimator = new Animator(0.30, Easing.InOutQuad, (t) => {
					currentAccBarValue = lv + ((newAV - lv) * t);
					
					if (currentAccBarValue > 0) {
						accBarLeft.style.width = "0";
						accBarRight.style.width = currentAccBarValue + "%";
					} else if (currentAccBarValue < 0) {
						accBarLeft.style.width = -currentAccBarValue + "%";
						accBarRight.style.width = "0";
					} else {
						accBarLeft.style.width = "0";
						accBarRight.style.width = "0";
					}
				});

				lastAcc = currentAcc;
			}, 300);

			accBarCurrent = document.getElementById("accBarCurrent");
			accBarReal = document.getElementById("accBarReal");
		});

		return {
			getToken,
			data,
			currentStatus,
			grade,
			gradeStyle,
			isMania,
			isPlayingOrWatching,
			accValue,
			realAcc,
			hideIfPlaying,
			showIfPlaying,
			showIfInPlayingField
		}
	},
};

export default app;
