import crypto from 'crypto';

export const rndString = async (bytes: number, encoding: BufferEncoding = 'base64url'): Promise<string> => {
	if (typeof window === 'undefined') {
		// Node.js environment
		return crypto.randomBytes(bytes).toString(encoding);
	} else {
		// Browser environment
		const buffer = new Uint8Array(bytes);
		window.crypto.getRandomValues(buffer);
		return Buffer.from(buffer).toString(encoding);
	}
};
