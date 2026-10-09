import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	// Loaded by the next-intl plugin in next.config.ts.
	entry: ['src/lib/i18n/request.ts'],
	ignoreIssues: {
		'src/app/api/v1/models.ts': ['exports'],
	},
	ignoreDependencies: ['@prisma/client', 'storyblok', '@typescript-eslint/parser'],
};

export default config;
