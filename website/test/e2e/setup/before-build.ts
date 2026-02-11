import fs from 'fs';
import path from 'path';

const MOCKSERVER_BASE = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
const MOCKSERVER = `${MOCKSERVER_BASE}/mock`;

// Keep FAR below mockserver 50mb limit
const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB safety limit

function jsonSize(value: unknown) {
	return Buffer.byteLength(JSON.stringify(value));
}

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

	const recordings: Record<string, any[]> = {};
	let fileCount = 0;

	for (const folder of fs.readdirSync(recordingsDir)) {
		const folderPath = path.join(recordingsDir, folder);
		if (!fs.statSync(folderPath).isDirectory()) continue;

		for (const file of fs.readdirSync(folderPath)) {
			if (!file.endsWith('.json')) continue;

			fileCount++;
			const data = JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf-8'));

			for (const [hash, entries] of Object.entries(data)) {
				if (!Array.isArray(entries)) {
					throw new Error(`[storyblok-mock] Invalid recording format in ${file} (${hash})`);
				}
				recordings[hash] ??= [];
				recordings[hash].push(...entries);
			}
		}
	}

	const hashes = Object.entries(recordings);
	console.log('[storyblok-mock] Files processed:', fileCount);
	console.log('[storyblok-mock] Hashes collected:', hashes.length);

	if (hashes.length === 0) {
		throw new Error('[storyblok-mock] No recordings found to upload');
	}

	// ──────────────────────────────────────────────
	// Size-aware chunking (never exceeds limit)
	// ──────────────────────────────────────────────

	let chunk: Record<string, any[]> = {};
	let chunkSize = 0;
	let chunkIndex = 1;
	let uploadedHashes = 0;

	async function flushChunk() {
		if (Object.keys(chunk).length === 0) return;

		const payload = {
			active: false,
			recordings: chunk,
			failedRequestsResponse: { error: 'Missing Storyblok recording' },
		};

		const sizeKb = Math.round(jsonSize(payload) / 1024);
		console.log(
			`[storyblok-mock] ⬆️ Uploading chunk ${chunkIndex} — ${Object.keys(chunk).length} hashes (~${sizeKb} KB)`,
		);

		const res = await fetch(`${MOCKSERVER}/recordings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			throw new Error(`[storyblok-mock] Upload failed (${res.status}): ${await res.text()}`);
		}

		uploadedHashes += Object.keys(chunk).length;
		chunk = {};
		chunkSize = 0;
		chunkIndex++;
	}

	for (const [hash, entries] of hashes) {
		const candidate = { [hash]: entries };
		const candidateSize = jsonSize(candidate);

		// Single hash too large → upload alone
		if (candidateSize > MAX_PAYLOAD_BYTES) {
			console.log(`[storyblok-mock] ⚠️ Large hash (${Math.round(candidateSize / 1024)} KB) — uploading alone`);
			await flushChunk();
			chunk = candidate;
			chunkSize = candidateSize;
			await flushChunk();
			continue;
		}

		if (chunkSize + candidateSize > MAX_PAYLOAD_BYTES) {
			await flushChunk();
		}

		chunk[hash] = entries;
		chunkSize += candidateSize;
	}

	await flushChunk();

	console.log(`[storyblok-mock] ⬆️ Upload complete — ${uploadedHashes} hashes sent`);

	// ──────────────────────────────────────────────
	// Rehash once
	// ──────────────────────────────────────────────

	console.log('[storyblok-mock] 🔁 Rehashing recordings…');

	const rehashRes = await fetch(`${MOCKSERVER}/recordings/rehash`, {
		method: 'POST',
	});

	if (!rehashRes.ok) {
		throw new Error(`[storyblok-mock] Rehash failed (${rehashRes.status}): ${await rehashRes.text()}`);
	}

	// ──────────────────────────────────────────────
	// Verify
	// ──────────────────────────────────────────────

	const verifyRes = await fetch(`${MOCKSERVER}/recordings`);
	const verifyData = await verifyRes.json();
	const verifyCount = Object.keys(verifyData).length;

	if (verifyCount === 0) {
		throw new Error('[storyblok-mock] Upload succeeded but mockserver is empty');
	}

	console.log(`[storyblok-mock] ✅ recordings ready (${verifyCount} hashes)`);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

run().catch((e) => {
	console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.error('[storyblok-mock] ❌ FAILED');
	console.error(e);
	console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	process.exit(1);
});
