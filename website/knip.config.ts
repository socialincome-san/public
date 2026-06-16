import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	ignoreFiles: ['test/e2e/setup/*.ts'],
	ignoreIssues: {
		'src/app/api/v1/models.ts': ['exports'],
	},
	ignoreDependencies: [
		'@sendgrid/mail',
		'@prisma/client',
		'@firebase/analytics',
		'@sendgrid/client',
		'@google-cloud/storage',
		'storyblok',
	],
};

export default config;
