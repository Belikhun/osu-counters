import lineChart from './LineChart.js';

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

const app = {
	name: 'App',
	components: {
		Linechart: lineChart,
	},

	setup(props, context) {
		const data = Vue.reactive({
			tokens: {},
			rws: {},
			settings: {},
		});

		const getToken = (tokenName, decimalPlaces) => _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);
		//either request all tokens upfront by filling their names in array
		//or request them later using helper getToken method above
		data.rws = watchTokens(['mapStrains'], (values) => {
			Object.assign(data.tokens, values);
		});

		const getWebOverlaySettings = () =>
			fetch(`${overlay.config.getUrl()}/settings`)
			.then((response) => response.json())
			.then((responseData) => JSON.parse(responseData.WebOverlay_Config));

		getWebOverlaySettings().then((config) => {
			Object.assign(data.settings, config);
		});

		let mapStrains = Vue.computed(() => Object.entries(data.tokens.mapStrains || {}));
		let isPlayingOrWatching = Vue.computed(() =>
			_IsInStatus(data.rws, data.tokens, [window.overlay.osuStatus.Playing, window.overlay.osuStatus.ResultsScreen, window.overlay.osuStatus.Watching])
		);

		let mapLength = Vue.computed(() => {
			let sec_num = Math.round(getToken("totaltime") / 1000);
			let hours   = Math.floor(sec_num / 3600);
			let minutes = Math.floor(sec_num / 60) % 60;
			let seconds = sec_num % 60;

			return [hours, minutes, seconds]
				.map(v => v < 10 ? "0" + v : v)
				.filter((v, i) => v !== "00" || i > 0)
				.join(":")
		});

		let isMania = Vue.computed(() => getToken('gameMode') === 'OsuMania');

		let mapPos = Vue.computed(
			() => getToken("mapPosition")
				.split(".")[0]
				.replace("00:", "")
		);

		let currentStatus = Vue.computed(() => rawStatus[getToken("osuIsRunning") ? (getToken("rawStatus") === "-1" ? 0 : getToken("rawStatus")) : "-1"]);
		let mapProgress = Vue.computed(() => getToken('time') / (getToken('totaltime') / 1000));

		return {
			getToken,

			data,

			isPlayingOrWatching,
			mapStrains,
			mapPos,
			mapProgress,
			mapLength,
			currentStatus,
			isMania
		};
	},

	computed: {
		overlaySettings() {
			if (Object.keys(this.data.settings).length === 0) return {};
			let s = this.data.settings;

			return {
				backgroundColor: s.ChartColor,
				chartProgressColor: s.ChartProgressColor,
				imageDimColor: s.ImageDimColor,
				artistTextColor: s.ArtistTextColor,
				titleTextColor: s.TitleTextColor,
				ppBackgroundColor: s.PpBackgroundColor,
				hit100BackgroundColor: s.Hit100BackgroundColor,
				hit50BackgroundColor: s.Hit50BackgroundColor,
				hitMissBackgroundColor: s.HitMissBackgroundColor,
				yAxesFontColor: s.HideChartLegend ? 'transparent' : 'white',

				simulatePPWhenListening: s.SimulatePPWhenListening,
				hideDiffText: s.HideDiffText,
				hideMapStats: s.HideMapStats,
				hideChartLegend: s.HideChartLegend,

				chartHeight: s.ChartHeight,
			};
		},

		progressChartSettings() {
			return {
				backgroundColor: this.overlaySettings.chartProgressColor,
				yAxesFontColor: 'transparent',
			};
		},

		chartStyle() {
			if (Object.keys(this.overlaySettings).length === 0)
				return `height: 200px`;

			return `height: ${this.overlaySettings.chartHeight}px;`;
		},

		progressChartStyle() {
			return `clip-path: inset(0px ${100 - this.mapProgress * 100}% 0px 0px);`;
		},

		progressIndicatorStyle() {
			return `left: ${this.mapProgress * 100}%;`;
		}
	},
};
export default app;