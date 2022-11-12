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
 * This implementation mimics the sdk implementation.
 */
// export const getDowloadURL = (ref: File) => {
//     const [metadata] = await ref.getMetadata();
//
//     const token = metadata.metadata.firebaseStorageDownloadTokens;
//     const link = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
//         pathToFile
//     )}?alt=media&token=${token}
// }
