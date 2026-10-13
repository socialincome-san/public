import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	// Loaded by the next-intl plugin in next.config.ts.
	entry: ['src/lib/i18n/request.ts'],
	ignoreIssues: {
		'src/app/api/v1/models.ts': ['exports'],
		// Loaded by name through jest.requireActual in jest.mock factories.
		'src/lib/audit/audited-transaction.fake.ts': ['exports'],
	},
	ignoreDependencies: ['@prisma/client', 'storyblok', '@typescript-eslint/parser'],
};

export default config;
