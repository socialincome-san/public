import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

async function waitForPort(timeoutMs = 60_000) {
	console.log('[storyblok-mock] waiting for mockserver TCP…', MOCKSERVER_BASE);

	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		try {
			// Root request — succeeds as soon as Express is listening
			await fetch(MOCKSERVER_BASE, { method: 'GET' });
			console.log('[storyblok-mock] mockserver TCP ready');
			return;
		} catch {
			await new Promise((r) => setTimeout(r, 500));
		}
	}

	throw new Error('[storyblok-mock] mockserver TCP not reachable (timeout)');
}

async function run() {
	console.log('[storyblok-mock] before-build start');
	console.log('[storyblok-mock] MOCKSERVER_URL =', MOCKSERVER_BASE);

	// 🔑 only wait for port, NOT routes
	await waitForPort();

	const recordingsDir = path.resolve('test/e2e/recordings');

	if (!fs.existsSync(recordingsDir)) {
		throw new Error(`[storyblok-mock] recordings directory not found: ${recordingsDir}`);
	}

	const recordings: Record<string, any[]> = {};

	for (const folder of fs.readdirSync(recordingsDir)) {
		const folderPath = path.join(recordingsDir, folder);
		if (!fs.statSync(folderPath).isDirectory()) continue;

		for (const file of fs.readdirSync(folderPath)) {
			if (!file.endsWith('.json')) continue;

			const data = JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf-8'));

			for (const [hash, entries] of Object.entries(data)) {
				recordings[hash] ??= [];
				recordings[hash].push(...(entries as any[]));
			}
		}
	}

	if (Object.keys(recordings).length === 0) {
		throw new Error('[storyblok-mock] No recordings found to upload');
	}

	console.log(`[storyblok-mock] uploading ${Object.keys(recordings).length} hashes`);

	const uploadRes = await fetch(`${MOCKSERVER}/recordings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			active: false,
			recordings,
			failedRequestsResponse: { error: 'Missing Storyblok recording' },
		}),
	});

	if (!uploadRes.ok) {
		throw new Error(`[storyblok-mock] Upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
	}

	const rehashRes = await fetch(`${MOCKSERVER}/recordings/rehash`, {
		method: 'POST',
	});

	if (!rehashRes.ok) {
		throw new Error(`[storyblok-mock] Rehash failed (${rehashRes.status}): ${await rehashRes.text()}`);
	}

	const verifyRes = await fetch(`${MOCKSERVER}/recordings`);
	const verifyData = await verifyRes.json();

	const count = Object.keys(verifyData).length;
	if (count === 0) {
		throw new Error('[storyblok-mock] Upload succeeded but recordings are empty');
	}

	console.log(`[storyblok-mock] ✅ recordings uploaded (${count} hashes)`);
}

run().catch((e) => {
	console.error('[storyblok-mock] ❌ FAILED');
	console.error(e);
	process.exit(1);
});
