import 'server-only';

import { Worker } from 'node:worker_threads';

// The cutout loops over every pixel synchronously, which would block all other requests for about half a second.
export const removePaperBackgroundInWorker = (image: Buffer) =>
	new Promise<Buffer>((resolve, reject) => {
		const worker = new Worker(new URL('./paper-cutout.worker.ts', import.meta.url), {
			// Turbopack spreads workerData into its own object, so it has to be an object itself.
			workerData: { image },
		});
		worker.once('message', (cutout: Uint8Array) => resolve(Buffer.from(cutout)));
		worker.once('error', reject);
		worker.once('exit', (code) => reject(new Error(`Paper cutout worker exited with code ${code}`)));
	});
