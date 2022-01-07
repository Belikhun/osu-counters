import background from './Background.js';

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
    Background: background,
  },
  setup(props, context) {
    const data = Vue.reactive({
      tokens: {},
      rws: {},
    });

    const getToken = (tokenName, decimalPlaces) =>
      _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);
    //either request all tokens upfront by filling their names in array
    //or request them later using helper getToken method above
    data.rws = watchTokens([], (values) => {
      Object.assign(data.tokens, values);
    });
    
    const totalTime = Vue.computed(() => {
      let time = getToken('totaltime');
      return (
        Math.floor(time / 1000 / 60).pad() +
        ':' +
        Math.floor((time / 1000) % 60).pad()
      );
    });

    let currentStatus = Vue.computed(() => rawStatus[getToken("osuIsRunning") ? (getToken("rawStatus") === "-1" ? 0 : getToken("rawStatus")) : "-1"]);

    return {
      getToken,

      totalTime,
      currentStatus
    };
  },
};

export default app;
