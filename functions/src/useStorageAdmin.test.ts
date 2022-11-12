import { describe, test } from '@jest/globals';
import { storage } from './useStorageAdmin';
import firebaseFunctionsTest from 'firebase-functions-test';
import { promises as fs, unlinkSync } from 'fs';
import axios from 'axios';

const { cleanup } = firebaseFunctionsTest();

describe('useStorageAdmin', () => {
	const tmpFile = 'tmp.txt';
	const testBucket = 'test';

	afterEach(() => {
		unlinkSync(tmpFile);
		cleanup();
	});

	test('upload private file', async () => {
		await fs.writeFile(tmpFile, 'test');
		const bucket = storage.bucket(testBucket);
		const uploadResponse = await bucket.upload(tmpFile);
		const [_, metadata] = uploadResponse;

		// I would expect a 403 or similar here instead of a 200!
		const directLink = metadata.mediaLink;
		const responseDirectLink = await axios.get(directLink);
		// returns Requesting http://127.0.0.1:9199/download/storage/v1/b/test/o/tmp.txt?generation=1668273207768&alt=media results in status code 200
		console.log(`Requesting ${directLink} results in status code ${responseDirectLink.status}`);
	});
});
