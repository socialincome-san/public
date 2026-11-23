module.exports = {
	preset: 'ts-jest/presets/js-with-ts',
	// ESM-only dependencies (i18n, Markdown) that Jest cannot require untransformed.
	transformIgnorePatterns: [
		'/node_modules/(?!(intl-messageformat|@formatjs|next-intl|use-intl|icu-minify|react-markdown|remark-.*|unified|bail|trough|devlop|is-plain-obj|vfile.*|unist-.*|mdast-.*|micromark.*|hast-.*|html-url-attributes|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities.*|trim-lines|estree-util-.*|escape-string-regexp)/)',
	],
	testEnvironment: 'node',
	testPathIgnorePatterns: ['\\.d\\.ts$', '\\.js$'],
	testTimeout: 60000,
	setupFiles: ['dotenv/config'],
	moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
