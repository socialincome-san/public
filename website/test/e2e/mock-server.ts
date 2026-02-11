import type { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

const RECORDINGS_PATH = path.resolve(process.cwd(), 'test/e2e/recordings/storyblok.json');

/**
 * ------------------------------------------------------------
 * Secret handling
 * ------------------------------------------------------------
 */

const SECRET_PATTERNS = ['SECRET', 'PASSWORD', 'API_KEY', 'TOKEN', 'AUTH'];

function hideAllSecrets(data: string): string {
	for (const key of Object.keys(process.env)) {
		const value = process.env[key];
		if (value && SECRET_PATTERNS.some((pattern) => key.includes(pattern))) {
			data = data.replaceAll(value, `${key}__REDACTED__`);
		}
	}
	return data;
}

function restoreAllSecrets(data: string): string {
	for (const key of Object.keys(process.env)) {
		const value = process.env[key];
		if (value && SECRET_PATTERNS.some((pattern) => key.includes(pattern))) {
			data = data.replaceAll(`${key}__REDACTED__`, value);
		}
	}
	return data;
}

/**
 * ------------------------------------------------------------
 * Stable JSON sorting (deterministic git diffs)
 * ------------------------------------------------------------
 */

function sortJsonByKey(obj: Record<string, any>): Record<string, any> {
	return Object.keys(obj)
		.sort()
		.reduce<Record<string, any>>((acc, key) => {
			acc[key] = obj[key];
			return acc;
		}, {});
}

/**
 * ------------------------------------------------------------
 * Internal helpers
 * ------------------------------------------------------------
 */

async function resetMockServer() {
	console.log('[storyblok-mock] Resetting mockserver');
	await fetch(`${MOCKSERVER}/reset`, { method: 'POST' });
}

async function waitForMockServer() {
	for (let i = 0; i < 20; i++) {
		try {
			await fetch(`${MOCKSERVER}/recordings`);
			return;
		} catch {
			await new Promise((r) => setTimeout(r, 250));
		}
	}
	throw new Error('Mockserver not reachable');
}

/**
 * ------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------
 */

export async function setupStoryblokMock() {
	const mode = process.env.STORYBLOK_MOCK_MODE;

	if (!mode) {
		return;
	}

	await waitForMockServer();
	await resetMockServer();

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

		const raw = fs.readFileSync(RECORDINGS_PATH, 'utf-8');
		const recordings = JSON.parse(restoreAllSecrets(raw));

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

	// give pending requests time to finish
	await page?.waitForTimeout(1500);

	const res = await fetch(`${MOCKSERVER}/recordings`);
	const recordings = await res.json();

	const sorted = sortJsonByKey(recordings);
	const sanitized = hideAllSecrets(JSON.stringify(sorted, null, 2));

	fs.mkdirSync(path.dirname(RECORDINGS_PATH), {
		recursive: true,
	});

	fs.writeFileSync(RECORDINGS_PATH, sanitized);

	console.log('[storyblok-mock] Recordings written to', RECORDINGS_PATH);
}
