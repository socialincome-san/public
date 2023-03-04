import crypto from 'crypto';

/**
 * random base64url string generator. E.g for passwords
 */
export const rndBase64 = (bytes: number) => {
	return crypto.randomBytes(bytes).toString('base64url');
};
