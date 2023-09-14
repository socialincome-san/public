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
	name: string;
	total: number;
	hashedInput: string;
	winners: Array<string>;
	randomness: string;
	round: number;
};

export async function loadPastDraws(): Promise<Array<PastDraw>> {
	const drawsPath = '../draws';
	const files = await fs.readdir(drawsPath);
	const draws: Array<PastDraw> = [];

	for (const file of files) {
		const drawContents = await fs.readFile(`${drawsPath}/${file}`);
		const drawFile: DrawFile = JSON.parse(drawContents.toString());
		draws.push({
			time: drawFile.time,
			name: drawFile.name,
			total: drawFile.total,
			drandRound: drawFile.round,
			drandRandomness: drawFile.randomness,
			count: drawFile.winners.length,
			filename: file,
		});
	}

	return draws;
}

export async function loadFutureDraws(): Promise<Array<FutureDraw>> {
	const futureDrawsPath = '../draws_upcoming';
	const files = await fs.readdir(futureDrawsPath);
	const draws: Array<FutureDraw> = [];

	for (const file of files) {
		const drawContents = await fs.readFile(`${futureDrawsPath}/${file}`);
		draws.push(JSON.parse(drawContents.toString()));
	}

	return draws;
}
