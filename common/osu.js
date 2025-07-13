
function odToMs(od) {
	return {
		hit300: (159 - 12 * od) / 2,
		hit100: (279 - 16 * od) / 2,
		hit50: (399 - 20 * od) / 2
	}
}

function osuHasHit() {
	const hits = app.get("play.hits");

	for (const value of Object.values(hits)) {
		if (value > 0)
			return true;
	}

	return false;
}

function getMinAcc() {
	const {
		"0": c0,
		"50": c50,
		"100": c100,
		"300": c300,
		geki,
		katu
	} = app.get("play.hits");

	const accuracy = (app.get("play.mode.name") == "mania")
		? (300 * (geki + c300) + (200 * katu) + (100 * c100) + (50 * c50))
			/ (300 * getTotalObjects())
		: (300 * c300 + 100 * c100 + 50 * c50)
			/ (300 * getTotalObjects());

	return accuracy * 100;
}

function getTotalObjects() {
	const { circles, holds, sliders, spinners } = app.get("beatmap.stats.objects");
	return circles + (holds * 2) + sliders + spinners;
}
