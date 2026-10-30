import { parentPort, workerData } from 'node:worker_threads';
import { removePaperBackground } from './paper-cutout';

parentPort?.postMessage(await removePaperBackground(Buffer.from(workerData.image)));
