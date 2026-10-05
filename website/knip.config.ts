import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	ignoreIssues: {
		'src/app/api/v1/models.ts': ['exports'],
	},
	ignoreDependencies: ['@prisma/client', 'storyblok', '@typescript-eslint/parser'],
};

export default config;
