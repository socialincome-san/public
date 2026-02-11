import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

async function run() {
	const recordingsDir = path.resolve('test/e2e/recordings');

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

	await fetch(`${MOCKSERVER}/recordings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			active: false,
			recordings,
			failedRequestsResponse: { error: 'Missing Storyblok recording' },
		}),
	});

	await fetch(`${MOCKSERVER}/recordings/rehash`, { method: 'POST' });

	console.log('[storyblok-mock] recordings uploaded');
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
