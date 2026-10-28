import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
	testEnvironment: 'node',
	moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
	testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/scripts/**/*.test.ts'],
});
