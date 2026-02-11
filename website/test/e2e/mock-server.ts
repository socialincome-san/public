import type { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

const RECORDINGS_PATH = path.resolve(process.cwd(), 'test/e2e/recordings/storyblok.json');

function sortJsonByKey(obj: Record<string, any>): Record<string, any> {
	return Object.keys(obj)
		.sort()
		.reduce<Record<string, any>>((acc, key) => {
			acc[key] = obj[key];
			return acc;
		}, {});
}

export async function setupStoryblokMock() {
	const mode = process.env.STORYBLOK_MOCK_MODE;

	if (!mode) {
		return;
	}

	await fetch(`${MOCKSERVER}/reset`, { method: 'POST' });

	if (mode === 'record') {
		console.log('[storyblok-mock] Enabling recording');

		await fetch(`${MOCKSERVER}/recordings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				active: true,
				deleteHeadersForHash: ['authorization', 'cookie', 'set-cookie', 'x-middleware-set-cookie', 'content-length'],
				failedRequestsResponse: {
					error: 'Unexpected external Storyblok call in replay mode',
				},
			}),
		});
	}

	if (mode === 'replay') {
		console.log('[storyblok-mock] Loading recordings');

		const recordings = JSON.parse(fs.readFileSync(RECORDINGS_PATH, 'utf-8'));

		await fetch(`${MOCKSERVER}/recordings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				active: false,
				recordings,
				failedRequestsResponse: {
					error: 'Missing Storyblok recording in replay mode',
				},
			}),
		});
	}
}

export async function saveStoryblokMock(page?: Page) {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record') {
		return;
	}
	console.log('[storyblok-mock] Saving recordings');

	await page?.waitForTimeout(1500);

	const res = await fetch(`${MOCKSERVER}/recordings`);
	const recordings = await res.json();

	const sorted = sortJsonByKey(recordings);

	fs.mkdirSync(path.dirname(RECORDINGS_PATH), {
		recursive: true,
	});

	fs.writeFileSync(RECORDINGS_PATH, JSON.stringify(sorted, null, 2));
	console.log('[storyblok-mock] Recordings written to', RECORDINGS_PATH);
}
