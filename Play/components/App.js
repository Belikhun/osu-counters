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

function odToMs(od) {
	return {
		hit300: (159 - 12 * od) / 2,
		hit100: (279 - 16 * od) / 2,
		hit50: (399 - 20 * od) / 2,
	};
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
		data.rws = watchTokens([], (values) => Object.assign(data.tokens, values));

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
			_IsInStatus(data.rws, data.tokens, [window.overlay.osuStatus.Playing, window.overlay.osuStatus.ResultsScreen, window.overlay.osuStatus.Watching])
		);

		let isMania = Vue.computed(() => getToken('gameMode') === 'OsuMania');
		let showIfInPlayingField = Vue.computed(() => [2, 8].includes(getToken("rawStatus")) ? "show" : "hide");
		let hideIfPlaying = Vue.computed(() => isPlayingOrWatching.value ? "hide" : "show");
		let showIfPlaying = Vue.computed(() => !isPlayingOrWatching.value ? "hide" : "show");

		let ppBarLeft, ppBarRight;
		let accBarLeft, accBarRight;
		let accBarCurrent, accBarReal;
		let ppBarCurrent, ppBarIfRestFC;
		let lastPP = 0, lastAcc = 0;
		let currentPP = 0, currentAcc = 0;

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
			ppBarLeft = document.getElementById("ppBarLeft");
			ppBarRight = document.getElementById("ppBarRight");

			setInterval(() => {
				// let tl = getToken("mapPosition");
				// let t = tl.split(":")
				// 	.reduce((prev, curr, pos) => prev + ([24 * 60, 60, 1][pos] * parseFloat(curr)), 0);
				
				if (showIfInPlayingField.value == "hide")
					return;

				let mpp = (isMania.value)
					? getToken("mania_m1_000_000PP")
					: getToken("ppIfRestFced");

				let d = (currentPP - lastPP);
				let c = (1 - Math.pow(2, -0.01 * Math.sqrt(mpp))) * mpp;
				let ps = 1 - Math.pow(2, -8 * (d / c));
				let p = scaleValue(Math.abs(ps), [0, 1], [0, 50]);

				if (d > 0) {
					ppBarLeft.style.width = '0';
					ppBarRight.style.width = `${p}%`;
				} else {
					ppBarLeft.style.width = `${p}%`;
					ppBarRight.style.width = '0';
				}

				lastPP = currentPP;
			}, 300);

			accBarLeft = document.getElementById("accBarLeft");
			accBarRight = document.getElementById("accBarRight");

			setInterval(() => {
				let c = 1 - (getToken("time") / (getToken("totaltime") / 1000));
				let m = (2 * Math.pow(c, 5)) + 0.05;
				let d = (currentAcc - lastAcc);
				let p = scaleValue(Math.abs(d), [0, m], [0, 50]);

				if (d > 0) {
					accBarLeft.style.width = '0';
					accBarRight.style.width = `${p}%`;
				} else {
					accBarLeft.style.width = `${p}%`;
					accBarRight.style.width = '0';
				}

				lastAcc = currentAcc;
			}, 150);

			accBarCurrent = document.getElementById("accBarCurrent");
			accBarReal = document.getElementById("accBarReal");
			ppBarCurrent = document.getElementById("ppBarCurrent");
			ppBarIfRestFC = document.getElementById("ppBarIfRestFC");
		});

		let unstableStyle = Vue.computed(() => {
			let u = getToken("unstableRate");

			if (u <= 150)
				return "green";
			else if (u <= 250)
				return "yellow";
			else
				return "red";
		});

		return {
			getToken,
			data,
			currentStatus,
			grade,
			gradeStyle,
			isMania,
			isPlayingOrWatching,
			ppValue,
			accValue,
			realAcc,
			unstableStyle,
			hideIfPlaying,
			showIfPlaying,
			showIfInPlayingField
		}
	},
};

export default app;
