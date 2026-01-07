import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	ignoreFiles: ['src/lib/database/schema.prisma'],
	ignoreDependencies: [
		'react',
		'react-hook-form',
		'zod',
		'@hookform/resolvers',
		'jest',
		'@sendgrid/mail',
		'dotenv-cli',
		'prisma',
		'next-openapi-gen',
		'tsx',
		'storyblok-js-client',
		'@radix-ui/react-accordion',
		'@radix-ui/react-popover',
		'@radix-ui/react-progress',
		'@radix-ui/react-switch',
		'@radix-ui/react-radio-group',
		'@firebase/analytics',
		'@sendgrid/client',
		'@google-cloud/storage',
		'xstate',
		'@xstate/react',
	],
	ignoreBinaries: [
		'tsx',
		'next',
		'firebase',
		'playwright',
		'eslint',
		'next-openapi-gen',
		'tsc',
		'dotenv',
		'prisma',
		'knip',
	],
	ignoreUnresolved: ['dotenv/config'],
};

export default config;
