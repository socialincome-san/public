import type { TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

function normalizeTestFileName(file: string) {
	return path
		.basename(file)
		.replace(/\.e2e\.ts$/, '')
		.replace(/\.ts$/, '');
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function recordingsPath(testInfo: TestInfo) {
	const [file, testName] = testInfo.titlePath;

	const folder = normalizeTestFileName(file);
	const slug = slugify(testName);

	return path.resolve(process.cwd(), 'test/e2e/recordings', folder, `${slug}.json`);
}

function sortJsonByKey(obj: Record<string, any>): Record<string, any> {
	return Object.keys(obj)
		.sort()
		.reduce<Record<string, any>>((acc, key) => {
			acc[key] = obj[key];
			return acc;
		}, {});
}

async function assertOk(res: Response, label: string) {
	if (res.ok) return;

	let body: string;
	try {
		body = await res.text();
	} catch {
		body = '<failed to read body>';
	}

	throw new Error(`[storyblok-mock] ${label} failed (${res.status} ${res.statusText})\n${body}`);
}

export async function setupStoryblokMock(testInfo: TestInfo) {
	const mode = process.env.STORYBLOK_MOCK_MODE;

	if (!mode) {
		return;
	}

	const resetRes = await fetch(`${MOCKSERVER}/reset`, { method: 'POST' });
	await assertOk(resetRes, 'reset');

	if (mode === 'record') {
		console.log('[storyblok-mock] Enabling recording');

		const res = await fetch(`${MOCKSERVER}/recordings`, {
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

		await assertOk(res, 'enable recording');
	}

	if (mode === 'replay') {
		console.log('[storyblok-mock] Loading recordings');

		const filePath = recordingsPath(testInfo);
		const recordings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

		const res = await fetch(`${MOCKSERVER}/recordings`, {
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

		await assertOk(res, 'load recordings');
	}
}

export async function saveStoryblokMock(testInfo: TestInfo) {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record') {
		return;
	}

	console.log('[storyblok-mock] Saving recordings');

	const res = await fetch(`${MOCKSERVER}/recordings`);
	await assertOk(res, 'fetch recordings');

	const recordings = await res.json();

	const sorted = sortJsonByKey(recordings);
	const filePath = recordingsPath(testInfo);

	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2));

	console.log('[storyblok-mock] Recordings written to', filePath);
}
