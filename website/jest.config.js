const nextJest = require('next/jest');

const createJestConfig = nextJest({
	dir: './',
});

/** @type {import('jest').Config} */
const config = {
	moduleDirectories: ['node_modules', '<rootDir>/'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // required to avoid "ReferenceError: Request is not defined" errors in tests https://github.com/vercel/next.js/issues/32848
	testEnvironment: 'jest-environment-jsdom',
	testPathIgnorePatterns: ['/__utils__/'],
};

module.exports = createJestConfig(config);
