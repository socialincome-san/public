module.exports = {
	preset: 'ts-jest/presets/js-with-ts',
	// ESM-only i18n dependencies that Jest cannot require untransformed.
	transformIgnorePatterns: ['/node_modules/(?!(intl-messageformat|@formatjs|next-intl|use-intl|icu-minify)/)'],
	testEnvironment: 'node',
	testPathIgnorePatterns: ['\\.d\\.ts$', '\\.js$'],
	testTimeout: 60000,
	setupFiles: ['dotenv/config'],
	moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
