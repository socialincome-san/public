import { Bucket } from '@google-cloud/storage';
import { randomBytes } from 'crypto';
import { getStorage } from 'firebase-admin/storage';
import { getOrInitializeApp } from './useApp';

getOrInitializeApp();

/**
 * direct access to the admin storage instance. Deployed, this has full admin access to the data.
 */
export const storage = getStorage();

/**
 * Unfortunately, in contrast to the client sdk, the admin storage sdk doesn't support to directly retrieve the download url of a file
 *
 * See https://github.com/firebase/firebase-admin-node/issues/1352 and
 * https://github.com/googleapis/nodejs-storage/issues/697
 *
 * This implementation sets an explicit token for the file which can be used to authorize the download.
 */
export const uploadAndGetDownloadURL = async (bucket: Bucket, filePath: string, destination?: string) => {
	const token = randomBytes(32).toString('hex');
	const [file, metadata] = await bucket.upload(filePath, {
		destination: destination || filePath,
		metadata: {
			metadata: {
				firebaseStorageDownloadTokens: token,
			},
		},
	});

	const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST
		? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
		: 'https://firebasestorage.googleapis.com';
	const downloadUrl = `${host}/v0/b/${metadata.bucket}/o/${encodeURIComponent(metadata.name)}?alt=media&token=${token}`;
	return {
		file,
		metadata,
		downloadUrl,
	};
};
