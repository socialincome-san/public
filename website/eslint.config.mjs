import { config } from '@smartive/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import backendArchitecturePlugin from './eslint-rules/backend-architecture.mjs';

const smartiveNextConfig = config('nextjs');

const prismaClientImportPaths = [
	{
		name: '@/generated/prisma/client',
		message: 'Only repositories may import Prisma client types.',
	},
	{
		name: '@/lib/database/prisma',
		message: 'Only repositories may access the Prisma client.',
	},
];

const providerSdkImportPaths = [
	{
		name: 'firebase-admin',
		message: 'Call Firebase through src/integrations instead of importing the SDK directly.',
	},
	{
		name: 'firebase-admin/auth',
		message: 'Call Firebase through src/integrations instead of importing the SDK directly.',
	},
	{
		name: 'firebase-admin/app',
		message: 'Call Firebase through src/integrations instead of importing the SDK directly.',
	},
	{
		name: 'twilio',
		message: 'Call Twilio through src/integrations instead of importing the SDK directly.',
	},
	{
		name: 'stripe',
		message: 'Call Stripe through src/integrations instead of importing the SDK directly.',
	},
	{
		name: '@sendgrid/mail',
		message: 'Call SendGrid through src/integrations instead of importing the SDK directly.',
	},
	{
		name: '@sendgrid/client',
		message: 'Call SendGrid through src/integrations instead of importing the SDK directly.',
	},
];

const providerSdkImportPatterns = [
	{
		group: ['firebase-admin/**', '@sendgrid/**'],
		message: 'Call provider SDKs through src/integrations instead of importing them directly.',
	},
];

const moduleSyntaxSelectors = [
	{
		selector: 'FunctionDeclaration',
		message: 'Modules and integrations use arrow functions assigned to const.',
	},
	{
		selector: 'ClassDeclaration',
		message: 'Modules and integrations use functions instead of classes.',
	},
	{
		selector: 'ExportDefaultDeclaration',
		message: 'Modules and integrations use named exports.',
	},
	{
		selector: 'TSTypeAssertion',
		message: 'Avoid type assertions in modules and integrations. Prefer type guards or explicit typing.',
	},
	{
		selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
		message: 'Avoid type assertions in modules and integrations. Prefer type guards or `as const`.',
	},
	{
		selector: 'TSNonNullExpression',
		message: 'Avoid non-null assertions in modules and integrations.',
	},
];

const moduleSyntaxRules = {
	'no-restricted-syntax': ['error', ...moduleSyntaxSelectors],
	'@typescript-eslint/no-explicit-any': 'error',
	'@typescript-eslint/ban-ts-comment': [
		'error',
		{
			'ts-expect-error': true,
			'ts-ignore': true,
			'ts-nocheck': true,
			'ts-check': false,
		},
	],
};

export default [
	{
		ignores: [
			'eslint.config.mjs',
			'eslint-rules/**',
			'prettier.config.cjs',
			'public/storybook/**',
			'src/generated/**',
			'storybook-static/**',
			'**/playwright-report/**',
		],
	},
	...smartiveNextConfig,
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react: reactPlugin,
			'backend-architecture': backendArchitecturePlugin,
		},
		rules: {
			'react/forbid-component-props': ['error', { forbid: ['style'] }],
		},
	},
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		...tseslint.configs.disableTypeChecked,
	},
	{
		files: ['src/modules/**/*.{ts,tsx}', 'src/integrations/**/*.{ts,tsx}'],
		ignores: ['src/modules/**/*.test.{ts,tsx}', 'src/integrations/**/*.test.{ts,tsx}'],
		rules: {
			...moduleSyntaxRules,
			'backend-architecture/safe-result-errors': 'error',
			'backend-architecture/filename-contract': 'error',
			'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
		},
	},
	{
		files: ['src/modules/**/*.{ts,tsx}'],
		ignores: ['src/modules/**/*.test.{ts,tsx}'],
		rules: {
			'backend-architecture/no-cross-module-deep-imports': 'error',
			'no-restricted-imports': [
				'error',
				{
					paths: providerSdkImportPaths,
					patterns: providerSdkImportPatterns,
				},
			],
		},
	},
	{
		files: ['src/modules/**/*.service.ts'],
		rules: {
			'backend-architecture/service-result-contract': 'error',
			'backend-architecture/no-service-throw': 'error',
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						...prismaClientImportPaths,
						{
							name: 'next/cache',
							message: 'Services must not call Next.js cache APIs. Revalidate from actions.',
						},
						{
							name: 'next/navigation',
							message: 'Services must not call Next.js navigation APIs. Redirect from actions.',
						},
					],
					patterns: [
						{
							group: ['@/app/**', '@/components/**'],
							message: 'Services must not depend on app or component layers.',
						},
						{
							group: ['**/*.actions', '**/*.actions.*'],
							message: 'Services must not import Server Actions.',
						},
						{
							group: ['@/modules/*/*.repository', '@/modules/*/*.permissions'],
							message: 'Cross-module imports must go through the owning module service, not internals.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/modules/**/*.actions.ts'],
		rules: {
			'backend-architecture/action-file-contract': 'error',
			'backend-architecture/action-unknown-params': 'error',
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'variable',
					modifiers: ['const', 'exported'],
					types: ['function'],
					format: null,
					custom: {
						regex: 'Action$',
						match: true,
					},
				},
			],
			'no-restricted-syntax': [
				'error',
				...moduleSyntaxSelectors,
				{
					selector:
						'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression[async!=true]',
					message: 'Exported Server Actions must be async functions.',
				},
				{
					selector: 'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > FunctionExpression[async!=true]',
					message: 'Exported Server Actions must be async functions.',
				},
			],
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: prismaClientImportPaths.map((path) => ({
						...path,
						message: 'Server Actions must not access Prisma.',
					})),
					patterns: [
						{
							group: ['**/*.repository', '**/*.repository.*'],
							message: 'Server Actions call services, not repositories.',
						},
						{
							group: ['**/*.permissions', '**/*.permissions.*'],
							message: 'Authorization belongs in services, not actions.',
						},
						{
							group: ['@/integrations/**'],
							message: 'Server Actions call services, not integrations.',
						},
						{
							group: ['@/app/**', '@/components/**'],
							message: 'Server Actions must not import app or component layers.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/modules/**/*.repository.ts'],
		rules: {
			'backend-architecture/repository-export-naming': 'error',
			'no-restricted-syntax': [
				'error',
				...moduleSyntaxSelectors,
				{
					selector: 'Property[key.name="include"], Property[key.value="include"]',
					message: 'Repositories must use explicit select instead of include.',
				},
			],
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'**/*.service',
								'**/*.service.*',
								'**/*.actions',
								'**/*.actions.*',
								'**/*.permissions',
								'**/*.permissions.*',
							],
							message: 'Repositories must not import services, actions, or permissions.',
						},
						{
							group: ['@/integrations/**'],
							message: 'Repositories must not call integrations.',
						},
						{
							group: ['@/app/**', '@/components/**', '@/lib/firebase/**'],
							message: 'Repositories must not depend on app, components, or auth providers.',
						},
						{
							group: ['firebase-admin', 'firebase-admin/**', 'twilio', 'stripe', '@sendgrid/**'],
							message: 'Repositories must not import external provider SDKs.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/modules/**/*.{schemas,permissions,types}.ts'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: prismaClientImportPaths,
					patterns: [
						{
							group: [
								'**/*.service',
								'**/*.service.*',
								'**/*.repository',
								'**/*.repository.*',
								'**/*.actions',
								'**/*.actions.*',
							],
							message: 'Schemas, permissions, and types must stay free of service/repository/action imports.',
						},
						{
							group: ['@/integrations/**'],
							message: 'Schemas, permissions, and types must not import integrations.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/modules/**/*.schemas.ts'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'variable',
					modifiers: ['const', 'exported'],
					format: null,
					custom: {
						regex: 'Schema$',
						match: true,
					},
				},
			],
		},
	},
	{
		files: ['src/modules/**/*.permissions.ts'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'variable',
					modifiers: ['const', 'exported'],
					types: ['function'],
					format: null,
					custom: {
						regex: '^(can|has|is|assert)[A-Z].*$',
						match: true,
					},
				},
			],
		},
	},
	{
		files: ['src/integrations/**/*.{ts,tsx}'],
		ignores: ['src/integrations/**/*.test.{ts,tsx}'],
		rules: {
			'backend-architecture/service-result-contract': 'error',
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: prismaClientImportPaths.map((path) => ({
						...path,
						message: 'Integrations must not access Prisma.',
					})),
					patterns: [
						{
							group: ['@/modules/**'],
							message: 'Dependency direction is modules to integrations.',
						},
						{
							group: ['@/app/**', '@/components/**'],
							message: 'Integrations must not depend on app or component layers.',
						},
						{
							group: ['next/cache', 'next/navigation', 'next/headers'],
							message: 'Integrations must not call Next.js boundary APIs.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/components/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@/lib/database/prisma',
							message: 'Components call module actions/services instead of Prisma.',
						},
						...providerSdkImportPaths,
					],
					patterns: [
						{
							group: ['@/integrations/**'],
							message: 'Components call module actions instead of integrations.',
						},
						{
							group: ['@/modules/**/*.service', '@/modules/**/*.repository', '@/modules/**/*.permissions'],
							message: 'Components may import module actions and type-only contracts, not services or internals.',
						},
						{
							group: ['@/modules/**/*.schemas'],
							allowTypeImports: true,
							message: 'Components may import schema types only, never runtime Zod schemas.',
						},
						...providerSdkImportPatterns,
					],
				},
			],
		},
	},
	{
		files: ['src/app/**/*.{ts,tsx}', 'src/lib/server-actions/**/*.{ts,tsx}'],
		ignores: ['src/app/api/health/database/route.ts', 'src/app/api/v1/twilio/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: '@/lib/database/prisma',
							message: 'App boundaries call module services instead of Prisma.',
						},
						...providerSdkImportPaths,
					],
					patterns: [
						{
							group: ['@/integrations/**'],
							message: 'App boundaries call module services instead of integrations.',
						},
						{
							group: ['@/modules/**/*.repository', '@/modules/**/*.permissions'],
							message: 'App boundaries must not import module repositories or permissions directly.',
						},
						...providerSdkImportPatterns,
					],
				},
			],
		},
	},
];
