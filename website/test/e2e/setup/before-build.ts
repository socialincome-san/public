import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

async function run() {
	console.log('[storyblok-mock] Starting before-build upload');
	console.log('[storyblok-mock] MOCKSERVER:', MOCKSERVER);
	console.log('[storyblok-mock] CWD:', process.cwd());

	const recordingsDir = path.resolve('test/e2e/recordings');
	console.log('[storyblok-mock] Looking for recordings in:', recordingsDir);

	if (!fs.existsSync(recordingsDir)) {
		throw new Error(`[storyblok-mock] recordings directory not found: ${recordingsDir}`);
	}

	const dirEntries = fs.readdirSync(recordingsDir);
	console.log('[storyblok-mock] Top-level entries:', dirEntries);

	const recordings: Record<string, any[]> = {};
	let fileCount = 0;

	for (const folder of dirEntries) {
		const folderPath = path.join(recordingsDir, folder);
		const stat = fs.statSync(folderPath);

		if (!stat.isDirectory()) {
			console.log(`[storyblok-mock] Skipping non-directory: ${folder}`);
			continue;
		}

		console.log(`[storyblok-mock] Reading folder: ${folder}`);

		const files = fs.readdirSync(folderPath);
		console.log(`[storyblok-mock] Files in ${folder}:`, files);

		for (const file of files) {
			if (!file.endsWith('.json')) {
				console.log(`[storyblok-mock] Skipping non-json file: ${file}`);
				continue;
			}

			fileCount++;
			const filePath = path.join(folderPath, file);
			console.log(`[storyblok-mock] Parsing ${filePath}`);

			const raw = fs.readFileSync(filePath, 'utf-8');
			const data = JSON.parse(raw);

			const hashes = Object.keys(data);
			console.log(`[storyblok-mock] → ${hashes.length} hashes in ${file}`);

			for (const [hash, entries] of Object.entries(data)) {
				if (!Array.isArray(entries)) {
					throw new Error(`[storyblok-mock] Invalid recording format in ${file} for hash ${hash}`);
				}

				recordings[hash] ??= [];
				recordings[hash].push(...entries);
			}
		}
	}

	const hashCount = Object.keys(recordings).length;

	console.log('[storyblok-mock] Files processed:', fileCount);
	console.log('[storyblok-mock] Total hashes collected:', hashCount);

	if (hashCount === 0) {
		throw new Error('[storyblok-mock] No recordings found to upload (0 hashes)');
	}

	console.log('[storyblok-mock] Uploading recordings to mockserver…');

	const uploadRes = await fetch(`${MOCKSERVER}/recordings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			active: false,
			recordings,
			failedRequestsResponse: { error: 'Missing Storyblok recording' },
		}),
	});

	const uploadText = await uploadRes.text();
	console.log('[storyblok-mock] Upload response:', uploadRes.status, uploadText);

	if (!uploadRes.ok) {
		throw new Error(`[storyblok-mock] Upload failed (${uploadRes.status})`);
	}

	console.log('[storyblok-mock] Rehashing recordings…');

	const rehashRes = await fetch(`${MOCKSERVER}/recordings/rehash`, { method: 'POST' });
	const rehashText = await rehashRes.text();
	console.log('[storyblok-mock] Rehash response:', rehashRes.status, rehashText);

	if (!rehashRes.ok) {
		throw new Error(`[storyblok-mock] Rehash failed (${rehashRes.status})`);
	}

	console.log('[storyblok-mock] Verifying mockserver state…');

	const verifyRes = await fetch(`${MOCKSERVER}/recordings`);
	const verifyData = await verifyRes.json();

	const verifyCount = Object.keys(verifyData).length;
	console.log('[storyblok-mock] Mockserver hash count:', verifyCount);

	if (verifyCount === 0) {
		throw new Error('[storyblok-mock] Upload succeeded but mockserver recordings are empty');
	}

	console.log(`[storyblok-mock] ✅ recordings uploaded successfully (${verifyCount} hashes)`);
}

run().catch((e) => {
	console.error('[storyblok-mock] ❌ FAILED');
	console.error(e);
	process.exit(1);
});
