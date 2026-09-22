import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getFirebaseAdminStorage } from './firebase-admin.integration';

export type FirebaseStorageFile = {
	name: string;
	updated: string | undefined;
	timeCreated: string | undefined;
};

export const isFirebaseStorageConfigured = (): boolean => Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

export const listFirebaseStorageFileNames = async (bucketName: string): Promise<ServiceResult<string[]>> => {
	try {
		const [files] = await getFirebaseAdminStorage().bucket(bucketName).getFiles();

		return resultOk(files.map(({ name }) => name));
	} catch (error) {
		console.error('Could not list Firebase Storage file names', { bucketName, error });

		return resultFail('Could not list Firebase Storage files');
	}
};

export const uploadFileToFirebaseStorage = async (
	sourceFilePath: string,
	destinationFilePath: string,
): Promise<ServiceResult<void>> => {
	const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
	if (!bucketName) {
		console.error('Firebase Storage bucket name missing');

		return resultFail('Firebase Storage bucket name missing');
	}

	try {
		await getFirebaseAdminStorage().bucket(bucketName).upload(sourceFilePath, {
			destination: destinationFilePath,
		});

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not upload file to Firebase Storage', { destinationFilePath, error });

		return resultFail('Could not upload file to Firebase Storage');
	}
};

export const listFirebaseStorageFiles = async (
	bucketName: string,
	fileNamePattern?: RegExp,
): Promise<ServiceResult<FirebaseStorageFile[]>> => {
	try {
		const [files] = await getFirebaseAdminStorage().bucket(bucketName).getFiles();
		const storageFiles = await Promise.all(
			files
				.filter((file) => !fileNamePattern || fileNamePattern.test(file.name))
				.map(async (file) => {
					const [metadata] = await file.getMetadata();

					return {
						name: file.name,
						updated: metadata.updated,
						timeCreated: metadata.timeCreated,
					};
				}),
		);

		return resultOk(storageFiles);
	} catch (error) {
		console.error('Could not list Firebase Storage files', { bucketName, error });

		return resultFail('Could not list Firebase Storage files');
	}
};

export const downloadFirebaseStorageFile = async (bucketName: string, fileName: string): Promise<ServiceResult<Buffer>> => {
	try {
		const [contents] = await getFirebaseAdminStorage().bucket(bucketName).file(fileName).download();

		return resultOk(contents);
	} catch (error) {
		console.error('Could not download Firebase Storage file', { bucketName, fileName, error });

		return resultFail('Could not download Firebase Storage file');
	}
};

export const uploadBufferToFirebaseStorage = async (
	bucketName: string,
	contents: Buffer,
	destinationFilePath: string,
): Promise<ServiceResult<void>> => {
	try {
		await getFirebaseAdminStorage().bucket(bucketName).file(destinationFilePath).save(contents);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not upload buffer to Firebase Storage', { bucketName, destinationFilePath, error });

		return resultFail('Could not upload buffer to Firebase Storage');
	}
};
