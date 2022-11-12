import {describe, test} from '@jest/globals';
import {storage} from "./useStorageAdmin";
import firebaseFunctionsTest from 'firebase-functions-test';
import { promises as fs, unlinkSync } from 'fs';
import axios from "axios";


const { cleanup } = firebaseFunctionsTest();

describe('useStorageAdmin', () => {
	const tmpFile = 'tmp.txt'
	const testBucket = 'test'

	afterEach(() =>  {
		unlinkSync(tmpFile);
		cleanup()
	});


	test('upload', async () => {
		await fs.writeFile(tmpFile, 'test');
		const bucket = storage.bucket(testBucket)
		const uploadResponse = await bucket.upload(tmpFile)
		const [file, _] = uploadResponse

		const [metadata] = await file.getMetadata();

		const token = metadata.firebaseStorageDownloadTokens;
		console.log(token)

		// I would expect a 403 or similar here instead of a 200!
		const directLink = metadata.mediaLink
		const responseDirectLink = await axios.get(directLink);
		console.log(`Requesting ${directLink} results in status code ${responseDirectLink.status}`) // returns 200
	});

});
