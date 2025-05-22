import crypto from 'crypto';

export const rndString = async (bytes: number, encoding: BufferEncoding = 'base64url'): Promise<string> => {
	if (typeof window === 'undefined') {
		// Node.js
		return crypto.randomBytes(bytes).toString(encoding);
	} else {
		// Browser
		const buffer = new Uint8Array(bytes);
		window.crypto.getRandomValues(buffer);

		let str = Buffer.from(buffer).toString(encoding === 'base64url' ? 'base64' : encoding);

		if (encoding === 'base64url') {
			// Convert base64 to base64url
			str = str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		}

		return str;
	}
};
