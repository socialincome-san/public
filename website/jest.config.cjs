module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['\\.d\\.ts$', '\\.js$'],
	testTimeout: 60000,
	setupFiles: ['dotenv/config'],
	moduleNameMapper: {
		'^@socialincome/design-system/cn$': '<rootDir>/../design-system/src/cn.ts',
		'^@socialincome/design-system/(.*)$': '<rootDir>/../design-system/src/components/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
};
