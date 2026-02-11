import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

// Tune if needed, but 20–50 is very safe for CI
const CHUNK_SIZE = 25;

async function run() {
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('[storyblok-mock] 🚀 Starting before-build upload');
	console.log('[storyblok-mock] MOCKSERVER:', MOCKSERVER);
	console.log('[storyblok-mock] CWD:', process.cwd());
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

		console.log(`[storyblok-mock] 📁 Reading folder: ${folder}`);

		const files = fs.readdirSync(folderPath);
		console.log(`[storyblok-mock] Files in ${folder}:`, files);

		for (const file of files) {
			if (!file.endsWith('.json')) {
				console.log(`[storyblok-mock] Skipping non-json file: ${file}`);
				continue;
			}

			fileCount++;
			const filePath = path.join(folderPath, file);
			console.log(`[storyblok-mock] 📄 Parsing ${filePath}`);

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

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('[storyblok-mock] Files processed:', fileCount);
	console.log('[storyblok-mock] Total hashes collected:', hashCount);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

	if (hashCount === 0) {
		throw new Error('[storyblok-mock] No recordings found to upload (0 hashes)');
	}

	// ──────────────────────────────────────────────
	// Chunked upload (fixes 413 Payload Too Large)
	// ──────────────────────────────────────────────

	const entries = Object.entries(recordings);
	const totalChunks = Math.ceil(entries.length / CHUNK_SIZE);

	console.log(`[storyblok-mock] ⬆️ Uploading ${entries.length} hashes in ${totalChunks} chunks (size=${CHUNK_SIZE})`);

	for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
		const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
		const chunkEntries = entries.slice(i, i + CHUNK_SIZE);
		const chunk = Object.fromEntries(chunkEntries);

		const payload = {
			active: false,
			recordings: chunk,
			failedRequestsResponse: { error: 'Missing Storyblok recording' },
		};

		const payloadSizeKb = Math.round(Buffer.byteLength(JSON.stringify(payload)) / 1024);

		console.log(
			`[storyblok-mock] ⬆️ Chunk ${chunkIndex}/${totalChunks} — ${Object.keys(chunk).length} hashes (~${payloadSizeKb} KB)`,
		);

		const res = await fetch(`${MOCKSERVER}/recordings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`[storyblok-mock] Upload failed (${res.status}) on chunk ${chunkIndex}: ${text}`);
		}
	}

	// ──────────────────────────────────────────────
	// Rehash once after all chunks
	// ──────────────────────────────────────────────

	console.log('[storyblok-mock] 🔁 Rehashing recordings…');

	const rehashRes = await fetch(`${MOCKSERVER}/recordings/rehash`, {
		method: 'POST',
	});

	if (!rehashRes.ok) {
		throw new Error(`[storyblok-mock] Rehash failed (${rehashRes.status}): ${await rehashRes.text()}`);
	}

	// ──────────────────────────────────────────────
	// Verify mockserver state
	// ──────────────────────────────────────────────

	console.log('[storyblok-mock] 🔍 Verifying mockserver state…');

	const verifyRes = await fetch(`${MOCKSERVER}/recordings`);
	if (!verifyRes.ok) {
		throw new Error(`[storyblok-mock] Verification failed (${verifyRes.status})`);
	}

	const verifyData = await verifyRes.json();
	const verifyCount = Object.keys(verifyData).length;

	console.log('[storyblok-mock] Mockserver hash count:', verifyCount);

	if (verifyCount === 0) {
		throw new Error('[storyblok-mock] Upload succeeded but mockserver recordings are empty');
	}

	console.log(`[storyblok-mock] ✅ recordings uploaded successfully (${verifyCount} hashes)`);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

run().catch((e) => {
	console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.error('[storyblok-mock] ❌ FAILED');
	console.error(e);
	console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	process.exit(1);
});
