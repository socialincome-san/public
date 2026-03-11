import fs from 'fs';
import path from 'path';

const BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCK = `${BASE}/mock`;
const RECORDINGS_DIR = path.resolve(process.cwd(), 'test/e2e/mock-server/recordings');

const post = (url: string, body?: unknown) =>
	fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});

const recordingPath = (recordingKey: string) =>
	path.resolve(RECORDINGS_DIR, recordingKey.endsWith('.json') ? recordingKey : `${recordingKey}.json`);

const hideToken = (json: string) => json.replace(/([?&]token=)[^&"]+/gi, '$1__TOKEN__');

const restoreToken = (json: string) =>
	process.env.STORYBLOK_PREVIEW_TOKEN
		? json.replace(/([?&]token=)__TOKEN__/gi, `$1${process.env.STORYBLOK_PREVIEW_TOKEN}`)
		: json;

const sortKeys = (o: Record<string, any>) =>
	Object.fromEntries(
		Object.keys(o)
			.sort()
			.map((k) => [k, o[k]]),
	);

const readReplayRecordings = (recordingKey: string) => {
	const raw = fs.readFileSync(recordingPath(recordingKey), 'utf-8');
	return JSON.parse(restoreToken(raw)) as unknown;
};

const writeRecordings = (recordingKey: string, recordings: unknown) => {
	const fp = recordingPath(recordingKey);
	fs.mkdirSync(path.dirname(fp), { recursive: true });
	const json = JSON.stringify(recordings, null, 2);
	fs.writeFileSync(fp, hideToken(json));
};

export const setupStoryblokMock = async (recordingKey: string) => {
	const mode = process.env.STORYBLOK_MOCK_MODE;

	if (!mode) {
		return;
	}

	await post(`${MOCK}/reset`);

	if (mode === 'record') {
		await post(`${MOCK}/recordings`, { active: true });
		return;
	}

	if (mode === 'replay') {
		const recordings = readReplayRecordings(recordingKey);
		await post(`${MOCK}/recordings`, {
			active: false,
			recordings,
		});
	}
};

export const saveStoryblokMock = async (recordingKey: string) => {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record') {
		return;
	}

	const res = await fetch(`${MOCK}/recordings`);
	const data = sortKeys((await res.json()) as Record<string, any>);
	writeRecordings(recordingKey, data);
};
