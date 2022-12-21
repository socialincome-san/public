import { describe, expect, test } from '@jest/globals';
import axios from 'axios';
import firebaseFunctionsTest from 'firebase-functions-test';
import { promises as fs, unlinkSync } from 'fs';
import { uploadAndGetDownloadURL } from '../src/firebase/storageAdmin';

const { cleanup } = firebaseFunctionsTest();

describe('useStorageAdmin', () => {
	const tmpFile = 'tmp.txt';

	afterEach(() => {
		unlinkSync(tmpFile);
		cleanup();
	});

	test('upload private file', async () => {
		await fs.writeFile(tmpFile, 'test');

		const { downloadUrl } = await uploadAndGetDownloadURL({ sourceFilePath: tmpFile });

		const response = await axios.get(downloadUrl);
		expect(response.status).toEqual(200);

		const downloadUrlWithoutToken = downloadUrl.slice(0, -71);
		// expect(await axios.get(linkWithoutToken)).toThrow(); fails with an "TypeError: Converting circular structure to JSON"
		// that's the reason for try catch syntax
		let error: boolean;
		try {
			await axios.get(downloadUrlWithoutToken);
			error = false;
		} catch {
			error = true;
		}
		expect(error).toEqual(true);
	});
});
