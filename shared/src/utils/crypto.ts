import crypto from 'crypto';

/**
 * random string generator. E.g for passwords
 */
export const rndString = (bytes: number, encoding: BufferEncoding = 'base64url') => {
	return crypto.randomBytes(bytes).toString(encoding);
};
