import { Bucket } from '@google-cloud/storage';
import { randomBytes } from 'crypto';
import { App } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getOrInitializeFirebaseAdmin } from './app';

/**
 * Unfortunately, in contrast to the client sdk, the admin storage sdk doesn't support to directly retrieve the download url of a file
 *
 * See https://github.com/firebase/firebase-admin-node/issues/1352 and
 * https://github.com/googleapis/nodejs-storage/issues/697
 *
 * This implementation sets an explicit token for the file which can be used to authorize the download.
 */
interface UploadProps {
	bucket?: Bucket;
	sourceFilePath: string;
	destinationFilePath: string;
}
export class StorageAdmin {
	/**
	 * direct access to the admin storage instance. Deployed, this has full admin access to the data.
	 */
	readonly storage: Storage;

	constructor(app?: App) {
		app = app ? app : getOrInitializeFirebaseAdmin();
		this.storage = getStorage(app);
	}

	uploadFile = async ({ bucket, sourceFilePath, destinationFilePath }: UploadProps) => {
		const destinationBucket = bucket || this.storage.bucket();
		await destinationBucket.upload(sourceFilePath, { destination: destinationFilePath });
	};

	uploadAndGetDownloadURL = async ({ bucket, sourceFilePath, destinationFilePath }: UploadProps) => {
		const destinationBucket = bucket || this.storage.bucket();
		const token = randomBytes(32).toString('hex');
		const [file, metadata] = await destinationBucket.upload(sourceFilePath, {
			destination: destinationFilePath,
			metadata: {
				metadata: {
					firebaseStorageDownloadTokens: token,
				},
			},
		});

		const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST
			? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
			: 'https://firebasestorage.googleapis.com';
		const downloadUrl = `${host}/v0/b/${metadata.bucket}/o/${encodeURIComponent(
			metadata.name,
		)}?alt=media&token=${token}`;
		return {
			file,
			metadata,
			downloadUrl,
		};
	};
}
