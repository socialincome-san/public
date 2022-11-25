const nextJest = require('next/jest');

const createJestConfig = nextJest({
	dir: './',
});

/** @type {import('jest').Config} */
const config = {
	// Add more setup options before each test is run
	// setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ['node_modules', '<rootDir>/'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // required to avoid "ReferenceError: Request is not defined" errors in tests https://github.com/vercel/next.js/issues/32848
	testEnvironment: 'jest-environment-jsdom',
	testPathIgnorePatterns: ['/__utils__/'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
