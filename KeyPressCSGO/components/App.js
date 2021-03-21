const app = {
	name: 'App',
	components: {},

	setup(props, context) {
		const data = Vue.reactive({
			tokens: {},
			rws: {}
		});

		const getToken = (tokenName, decimalPlaces) => _GetToken(data.rws, data.tokens, tokenName, decimalPlaces);

		let kps = 0;

		//either request all tokens upfront by filling their names in array
		//or request them later using helper getToken method above
		data.rws = watchTokens([], (values) => {
			Object.assign(data.tokens, values);
			kps++;
			
			for (let key of Object.keys(values)) {
				let target = document.querySelector(`.key[data-key-token="${key}"]`);

				if (target) {
					//? Trigger Reflow
					target.style.animation = "none";
					target.offsetHeight;
					target.style.animation = null;
				}
			}
		});

		setInterval(() => {
			document.getElementById("kpsValue").innerText = kps;
			kps = 0;
		}, 1000);

		return {
			getToken
		}
	},
};

export default app;
