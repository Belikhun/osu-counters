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

		let currentStatus = Vue.computed(() => ({
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
		}[getToken("rawStatus")]));

		let grade = Vue.computed(() => ["SS+", "S+", "SS", "S", "A", "B", "C", "D", "F", "?"][getToken('grade')]);

		let gradeStyle = Vue.computed(() => {
			let g = getToken('grade');
			console.log(g);

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

		let ppValue = Vue.computed(() => {
			if (isPlayingOrWatching.value)
				return getToken("ppIfMapEndsNow", 2);
				
			return getToken("simulatedPp", 2);
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

		let showIfInPlayingField = Vue.computed(() => [2, 8].includes(getToken("rawStatus")) ? "show" : "hide");
		let hideIfPlaying = Vue.computed(() => isPlayingOrWatching.value ? "hide" : "show");
		let showIfPlaying = Vue.computed(() => !isPlayingOrWatching.value ? "hide" : "show");

		return {
			getToken,
			data,
			currentStatus,
			grade,
			gradeStyle,
			isPlayingOrWatching,
			ppValue,
			unstableStyle,
			hideIfPlaying,
			showIfPlaying,
			showIfInPlayingField
		}
	},
};

export default app;
