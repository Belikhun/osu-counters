
const UnstableRateCounter = {
	init() {
		UnstableRatePanel.init();
		app.root.append(UnstableRatePanel.container);
	}
}

app.registerCounter(UnstableRateCounter);
