import * as fs from 'fs/promises';

export type FutureDraw = {
	time: number;
	name: string;
	count: number;
	total: number;
};

export type PastDraw = {
	time: number;
	name: string;
	count: number;
	total: number;
	drandRound: number;
	drandRandomness: string;
	filename: string;
};

type DrawFile = {
	time: number;
	totalCount: number;
	winners: Array<string>;
	randomness: string;
	round: number;
};

export async function loadPastDraws(): Promise<Array<PastDraw>> {
	const drawsPath = '../recipients_selection/draws';
	const files = await fs.readdir(drawsPath);
	const draws: Array<PastDraw> = [];

	for (const file of files) {
		const drawContents = await fs.readFile(`${drawsPath}/${file}`);
		const drawFile: DrawFile = JSON.parse(drawContents.toString());

		draws.push({
			time: drawFile.time,
			name: extractDrawName(file),
			total: drawFile.totalCount,
			drandRound: drawFile.round,
			drandRandomness: drawFile.randomness,
			count: drawFile.winners.length,
			filename: file,
		});
	}

	return draws;
}

// extracts the name from a file of format `{count}-{name}-{date}.txt` and capitalises the first letter
function extractDrawName(filename: string): string {
	const drawNameMatch = filename.match(/\d-([A-Za-z \-]+)-.*\.txt/);
	if (drawNameMatch == null || drawNameMatch.length < 2) {
		return '';
	}
	const unsanitisedName = drawNameMatch[1];
	const withSpaces = unsanitisedName.replaceAll('-', ' ');
	return withSpaces.slice(0, 1).toUpperCase() + withSpaces.slice(1).toLowerCase();
}
