import { readFileSync } from 'fs';
import * as fs from 'fs/promises';

const DRAWS_PATH = '../recipients_selection/draws';

export type Draw = {
	name: string;
	time: number;
	count: number;
	total: number;
};

export type CompletedDraw = {
	drandRound: number;
	drandRandomness: string;
	filename: string;
} & Draw;

type DrawFile = {
	time: number;
	totalCount: number;
	winners: Array<string>;
	randomness: string;
	round: number;
};

export async function loadPastDraws(): Promise<Array<CompletedDraw>> {
	const files = await fs.readdir(DRAWS_PATH);
	try {
		return (
			files
				.map((file) => {
					const drawContents = readFileSync(`${DRAWS_PATH}/${file}`);
					const drawFile: DrawFile = JSON.parse(drawContents.toString());
					return {
						time: drawFile.time,
						name: extractDrawName(file),
						total: drawFile.totalCount,
						drandRound: drawFile.round,
						drandRandomness: drawFile.randomness,
						count: drawFile.winners.length,
						filename: file,
					};
				})
				// sort the draws in descending order by time
				.sort((a, b) => b.time - a.time)
		);
	} catch (e) {
		console.error(e);
		return [];
	}
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
