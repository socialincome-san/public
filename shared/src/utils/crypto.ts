export const generateRandomString = (length: number = 16) => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
	const charsetLength = charset.length;
	const password = [];

	const cryptoObj = typeof window !== 'undefined' && window.crypto ? window.crypto : require('crypto').webcrypto;

	const randomValues = new Uint8Array(length);
	cryptoObj.getRandomValues(randomValues);

	for (let i = 0; i < length; i++) {
		password.push(charset[randomValues[i] % charsetLength]);
	}

	return password.join('');
};
