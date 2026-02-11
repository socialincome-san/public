import type { TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalizeTestFileName(file: string) {
	return path.basename(file).replace(/\.e2e\.ts$/, '');
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

export async function setupStoryblokMock(testInfo: TestInfo) {
	const mode = process.env.STORYBLOK_MOCK_MODE;

	if (!mode) {
		return;
	}

	console.log('[storyblok-mock] Resetting mockserver');
	await fetch(`${MOCKSERVER}/reset`, { method: 'POST' });
	await sleep(500);

	if (mode === 'record') {
		console.log('[storyblok-mock] Enabling recording');

		await fetch(`${MOCKSERVER}/recordings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				active: true,
				deleteHeadersForHash: ['authorization', 'cookie', 'set-cookie', 'x-middleware-set-cookie', 'content-length'],
			}),
		});

		await sleep(300);
	}

	if (mode === 'replay') {
		const filePath = recordingsPath(testInfo);

		console.log('[storyblok-mock] Loading recordings from', filePath);

		const recordings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

		const uploadRes = await fetch(`${MOCKSERVER}/recordings`, {
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

		console.log('[storyblok-mock] Upload status', uploadRes.status);
		await sleep(300);

		console.log('[storyblok-mock] Rehashing recordings');
		const rehashRes = await fetch(`${MOCKSERVER}/recordings/rehash`, {
			method: 'POST',
		});

		if (!rehashRes.ok) {
			throw new Error(`[storyblok-mock] Rehash failed (${rehashRes.status})`);
		}

		await sleep(300);

		const verifyRes = await fetch(`${MOCKSERVER}/recordings`);
		const verifyData = await verifyRes.json();

		if (!verifyData || Object.keys(verifyData).length === 0) {
			throw new Error('[storyblok-mock] Recordings not loaded (empty state)');
		}

		console.log('[storyblok-mock] Recordings ready');
	}
}

export async function saveStoryblokMock(testInfo: TestInfo) {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record') {
		return;
	}

	console.log('[storyblok-mock] Saving recordings');
	await sleep(1000);

	const res = await fetch(`${MOCKSERVER}/recordings`);
	const recordings = await res.json();

	const sorted = sortJsonByKey(recordings);
	const filePath = recordingsPath(testInfo);

	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2));

	console.log('[storyblok-mock] Recordings written to', filePath);
}
