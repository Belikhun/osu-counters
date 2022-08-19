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
			console.warn(`Animator().update():`, e);
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
		let ppBarLeft;
		/** @type {HTMLElement} */
		let ppBarRight;

		let ppBarCurrent, ppBarIfRestFC;

		/** @type {Animator} */
		let ppAnimator = null;
		let lastPP = 0;
		let currentPP = 0;
		let currentPPBarValue = 0;

		let ppValue = Vue.computed(() => {
			let mpp = (isMania.value)
				? getToken("mania_m1_000_000PP")
				: getToken("osu_mSSPP");

			if (isPlayingOrWatching.value)
				currentPP = getToken("ppIfMapEndsNow", 2);
			else
				currentPP = getToken("simulatedPp", 2);
			
			if (ppBarCurrent)
				ppBarCurrent.style.width = `${scaleValue(currentPP, [0, mpp], [0, 100])}%`;

			if (ppBarIfRestFC)
				ppBarIfRestFC.style.width = `${scaleValue(getToken("ppIfRestFced"), [0, mpp], [0, 100])}%`;

			return currentPP;
		});

		Vue.onMounted(() => {
			ppBarLeft = document.getElementById("ppBarLeft");
			ppBarRight = document.getElementById("ppBarRight");

			setInterval(() => {
				// let tl = getToken("mapPosition");
				// let t = tl.split(":")
				// 	.reduce((prev, curr, pos) => prev + ([24 * 60, 60, 1][pos] * parseFloat(curr)), 0);
				
				if (showIfInPlayingField.value == "hide")
					return;

				let lv = currentPPBarValue;
				let d = (currentPP - lastPP);
				let p = scaleValue(Math.abs(d), [0, 5], [0, 50]);
				let newPV = (d > 0) ? p : -p;

				if (newPV - lv === 0) {
					ppBarLeft.style.width = "0";
					ppBarRight.style.width = "0";
					return;
				}
				
				if (ppAnimator) {
					ppAnimator.cancel();
					ppAnimator = null;
				}

				ppAnimator = new Animator(0.30, Easing.InOutQuad, (t) => {
					currentPPBarValue = lv + ((newPV - lv) * t);
					
					if (currentPPBarValue > 0) {
						ppBarLeft.style.width = "0";
						ppBarRight.style.width = currentPPBarValue + "%";
					} else if (currentPPBarValue < 0) {
						ppBarLeft.style.width = -currentPPBarValue + "%";
						ppBarRight.style.width = "0";
					} else {
						ppBarLeft.style.width = "0";
						ppBarRight.style.width = "0";
					}
				});

				lastPP = currentPP;
			}, 300);

			ppBarCurrent = document.getElementById("ppBarCurrent");
			ppBarIfRestFC = document.getElementById("ppBarIfRestFC");
		});

		return {
			getToken,
			data,
			currentStatus,
			isMania,
			ppValue,
			isPlayingOrWatching,
			hideIfPlaying,
			showIfPlaying,
			showIfInPlayingField
		}
	},
};

export default app;
