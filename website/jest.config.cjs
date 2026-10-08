module.exports = {
	preset: 'ts-jest/presets/js-with-ts',
	// ESM-only dependencies of i18next-icu that Jest cannot require untransformed.
	transformIgnorePatterns: ['/node_modules/(?!(intl-messageformat|@formatjs)/)'],
	testEnvironment: 'node',
	testPathIgnorePatterns: ['\\.d\\.ts$', '\\.js$'],
	testTimeout: 60000,
	setupFiles: ['dotenv/config'],
	moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
