/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['.d.ts', '.js'],
	testTimeout: 60000,
	setupFiles: ['dotenv/config'],
};
