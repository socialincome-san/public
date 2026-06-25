import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	ignoreFiles: ['test/e2e/setup/*.ts'],
	ignoreIssues: {
		'src/app/api/v1/models.ts': ['exports'],
	},
	ignoreDependencies: ['@prisma/client', 'storyblok'],
};

export default config;
