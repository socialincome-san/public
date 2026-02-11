import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

export default async function globalSetup() {
	if (process.env.STORYBLOK_MOCK_MODE !== 'replay') {
		return;
	}

	const recordingsDir = path.resolve(process.cwd(), 'test/e2e/recordings');

	if (!fs.existsSync(recordingsDir)) {
		throw new Error('[storyblok-mock] recordings directory not found');
	}

	const recordings: Record<string, any[]> = {};

	for (const folder of fs.readdirSync(recordingsDir)) {
		const folderPath = path.join(recordingsDir, folder);
		if (!fs.statSync(folderPath).isDirectory()) continue;

		for (const file of fs.readdirSync(folderPath)) {
			if (!file.endsWith('.json')) continue;

			const filePath = path.join(folderPath, file);
			const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

			for (const [hash, entries] of Object.entries(data)) {
				if (!recordings[hash]) {
					recordings[hash] = [];
				}
				recordings[hash].push(...(entries as any[]));
			}
		}
	}

	const recordingRes = await fetch(`${MOCKSERVER}/recordings`, {
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

	if (!recordingRes.ok) {
		throw new Error(`[storyblok-mock] Failed to upload recordings: ${recordingRes.statusText}`);
	}

	const rehashRes = await fetch(`${MOCKSERVER}/recordings/rehash`, {
		method: 'POST',
	});

	if (!rehashRes.ok) {
		throw new Error(`[storyblok-mock] Failed to rehash recordings: ${rehashRes.statusText}`);
	}
}
