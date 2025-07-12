
const client = new WebSocketManager(window.location.host);
let index = 0;

client.api_v2((data) => {
	const { play } = data;
	console.log(index++, play);
});
