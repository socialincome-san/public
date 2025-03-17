import { Bucket } from '@google-cloud/storage';
import { App } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getOrInitializeFirebaseAdmin } from './app';

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
		return await destinationBucket.upload(sourceFilePath, { destination: destinationFilePath });
	};
}
