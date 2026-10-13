import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import test from 'node:test';
import backendArchitecturePlugin from './backend-architecture.mjs';

const createLinter = () => new Linter({ configType: 'flat' });

const lint = ({ code, filename, rules }) => {
	const linter = createLinter();

	return linter.verify(
		code,
		[
			{
				files: ['**/*.{ts,tsx}'],
				languageOptions: {
					parser: tsParser,
					parserOptions: {
						ecmaVersion: 'latest',
						sourceType: 'module',
					},
				},
				plugins: {
					'backend-architecture': backendArchitecturePlugin,
				},
				rules,
			},
		],
		{ filename },
	);
};

const messageIds = (messages) => messages.map((message) => message.messageId);

test('action-file-contract accepts valid server actions', () => {
	const messages = lint({
		filename: 'src/modules/example/example.actions.ts',
		rules: { 'backend-architecture/action-file-contract': 'error' },
		code: `'use server';

export const createExampleAction = async (input: unknown) => {
	return input;
};
`,
	});

	assert.deepEqual(messages, []);
});

test('action-file-contract rejects missing use server and non-function exports', () => {
	const messages = lint({
		filename: 'src/modules/example/example.actions.ts',
		rules: { 'backend-architecture/action-file-contract': 'error' },
		code: `export const createExampleAction = async () => {};
export const exampleConstant = 1;
export default async function broken() {}
`,
	});

	assert.deepEqual(new Set(messageIds(messages)), new Set(['missingUseServer', 'namedFunctionsOnly', 'noDefaultExport']));
});

test('result-contract requires annotated Result returns', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/result-contract': 'error' },
		code: `import type { Result } from '@/lib/result';

export const createExample = async (): Promise<Result<{ id: string }>> => {
	return { success: true, data: { id: '1' } };
};

export const exampleHelpers = {
	createExample,
};
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/result-contract': 'error' },
		code: `export const createExample = async () => {
	return { id: '1' };
};
`,
	});
	assert.deepEqual(messageIds(invalid), ['missingResultType']);
});

test('result-contract requires annotated Result returns on actions', () => {
	const valid = lint({
		filename: 'src/modules/example/example.actions.ts',
		rules: { 'backend-architecture/result-contract': 'error' },
		code: `'use server';

export const createExampleAction = async (input: unknown): Promise<Result<{ id: string }>> => {
	return { success: true, data: { id: '1' } };
};
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.actions.ts',
		rules: { 'backend-architecture/result-contract': 'error' },
		code: `'use server';

export const createExampleAction = async (input: unknown) => {
	return { id: '1' };
};
`,
	});
	assert.deepEqual(messageIds(invalid), ['missingResultType']);
});

test('result-contract allows sync integration helpers without Result', () => {
	const messages = lint({
		filename: 'src/integrations/example/example.integration.ts',
		rules: { 'backend-architecture/result-contract': 'error' },
		code: `import type { Result } from '@/lib/result';

export const mapExample = (value: string): string => value;

export const createExample = async (): Promise<Result<{ id: string }>> => {
	return { success: true, data: { id: '1' } };
};
`,
	});

	assert.deepEqual(messages, []);
});

test('safe-result-errors accepts fixed resultFail messages', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/safe-result-errors': 'error' },
		code: `import { resultFail } from '@/lib/result';

const fixedMessage = 'Could not create example' as const;

export const failExample = (useAlternative: boolean) =>
	useAlternative ? resultFail(fixedMessage) : resultFail(\`Example unavailable\`);
`,
	});
	assert.deepEqual(valid, []);
});

test('safe-result-errors rejects dynamic resultFail messages', () => {
	const invalid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/safe-result-errors': 'error' },
		code: `import { resultFail } from '@/lib/result';

export const failExample = (error: { message: string }, parseResult: { error: { issues: { message: string }[] } }) => {
	resultFail(\`Could not create example: \${error.message}\`);
	resultFail(error.message);
	resultFail('Could not create example: ' + error.message);
	resultFail(\`Could not create example: \${JSON.stringify(error)}\`);
	resultFail(parseResult.error.issues[0]?.message ?? 'Invalid input');
};
`,
	});
	assert.deepEqual(messageIds(invalid), [
		'unsafeResultError',
		'unsafeResultError',
		'unsafeResultError',
		'unsafeResultError',
		'unsafeResultError',
	]);
});

test('filename-contract enforces approved suffixes', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/filename-contract': 'error' },
		code: `export const createExample = async () => {};
`,
	});
	assert.deepEqual(valid, []);

	const validCache = lint({
		filename: 'src/modules/example/example.cache.ts',
		rules: { 'backend-architecture/filename-contract': 'error' },
		code: `export const getExample = async () => {};
`,
	});
	assert.deepEqual(validCache, []);

	const invalid = lint({
		filename: 'src/modules/example/example.utils.ts',
		rules: { 'backend-architecture/filename-contract': 'error' },
		code: `export const createExample = async () => {};
`,
	});
	assert.deepEqual(messageIds(invalid), ['invalidModuleFilename']);
});

test('no-cross-module-deep-imports blocks repository imports from another module', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/no-cross-module-deep-imports': 'error' },
		code: `import { createOther } from '@/modules/other/other.service';
import { getOther } from '@/modules/other/other.cache';
import type { OtherType } from '@/modules/other/other.types';
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/no-cross-module-deep-imports': 'error' },
		code: `import { findOther } from '@/modules/other/other.repository';
`,
	});
	assert.deepEqual(messageIds(invalid), ['deepImport']);
});

test('repository-export-naming requires persistence verbs', () => {
	const valid = lint({
		filename: 'src/modules/example/example.repository.ts',
		rules: { 'backend-architecture/repository-export-naming': 'error' },
		code: `export const findExample = async () => null;
export const removeExampleFromProgram = async () => null;
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.repository.ts',
		rules: { 'backend-architecture/repository-export-naming': 'error' },
		code: `export const handleExample = async () => null;
`,
	});
	assert.deepEqual(messageIds(invalid), ['invalidName']);
});

test('action-unknown-params requires unknown or FormData parameters', () => {
	const valid = lint({
		filename: 'src/modules/example/example.actions.ts',
		rules: { 'backend-architecture/action-unknown-params': 'error' },
		code: `'use server';

export const createExampleAction = async (input: unknown, sessionType: unknown = 'user') => input;
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.actions.ts',
		rules: { 'backend-architecture/action-unknown-params': 'error' },
		code: `'use server';

export const createExampleAction = async (input: string) => input;
`,
	});
	assert.deepEqual(messageIds(invalid), ['untrustedParam']);
});

test('no-service-throw rejects thrown errors in services', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/no-service-throw': 'error' },
		code: `export const createExample = async () => ({ success: false, error: 'nope' });
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/no-service-throw': 'error' },
		code: `export const createExample = async () => {
	throw new Error('nope');
};
`,
	});
	assert.deepEqual(messageIds(invalid), ['noThrow']);
});

test('types-file-no-runtime-functions allows type exports and inert constants', () => {
	const messages = lint({
		filename: 'src/modules/example/example.types.ts',
		rules: { 'backend-architecture/types-file-no-runtime-functions': 'error' },
		code: `export type Example = { id: string };
export const EXAMPLE_STATUSES = ['active', 'inactive'] as const;
export const EXAMPLE_LABELS = { active: 'Active', inactive: 'Inactive' };
export const EXAMPLE_LIMIT = 10;
`,
	});

	assert.deepEqual(messages, []);
});

test('types-file-no-runtime-functions rejects direct and referenced function exports', () => {
	const messages = lint({
		filename: 'src/modules/example/example.types.ts',
		rules: { 'backend-architecture/types-file-no-runtime-functions': 'error' },
		code: `export function parseExample(value: string) {
	return value.trim();
}

export const validateExample = (value: string) => value.length > 0;
const calculateExample = function (value: number) {
	return value * 2;
};
export { calculateExample };
`,
	});

	assert.deepEqual(messageIds(messages), ['runtimeFunction', 'runtimeFunction', 'runtimeFunction']);
});

test('kebab-case-paths accepts dotted suffixes and Next.js route segments', () => {
	for (const filename of [
		'src/modules/example/example.service.ts',
		'src/lib/i18n/use-translator.ts',
		'src/lib/utils/video-match-and-extract.test.ts',
		'src/app/portal/programs/[programId]/page.tsx',
		'src/app/[lang]/[...not-found]/page.tsx',
		'src/app/robots.txt/route.ts',
		'src/app/(portal)/layout.tsx',
	]) {
		const messages = lint({
			filename,
			rules: { 'backend-architecture/kebab-case-paths': 'error' },
			code: 'export const value = 1;\n',
		});

		assert.deepEqual(messages, [], filename);
	}
});

test('kebab-case-paths rejects camelCase file and directory names', () => {
	for (const filename of [
		'src/lib/i18n/useTranslator.ts',
		'src/lib/utils/UrlVideoParser.ts',
		'src/components/hooks/useIsPage.ts',
		'src/components/UseHooks/use-auth.ts',
	]) {
		const messages = lint({
			filename,
			rules: { 'backend-architecture/kebab-case-paths': 'error' },
			code: 'export const value = 1;\n',
		});

		assert.equal(messages.length > 0, true, filename);
		assert.ok(
			messages.every((message) => message.messageId === 'kebabCase'),
			filename,
		);
	}
});

test('kebab-case-paths ignores generated code and Prisma migrations', () => {
	for (const filename of [
		'src/generated/prisma/models/Campaign.ts',
		'src/lib/database/migrations/20260114_login_as_local_partner/migration.ts',
	]) {
		const messages = lint({
			filename,
			rules: { 'backend-architecture/kebab-case-paths': 'error' },
			code: 'export const value = 1;\n',
		});

		assert.deepEqual(messages, [], filename);
	}
});

const auditedWritesRule = (options = {}) => ({
	'backend-architecture/audited-writes': ['error', { auditedModels: ['recipient'], ...options }],
});

test('audited-writes accepts reads and writes through an audited transaction', () => {
	const messages = lint({
		filename: 'src/modules/example/example.repository.ts',
		rules: auditedWritesRule({ requireAuditedWrites: true }),
		code: `import { getTransactionClient, type AuditedTransaction } from '@/lib/database/audited-transaction';
import { prisma } from '@/lib/database/prisma';
import { unauditedWrite } from '@/lib/database/unaudited-write';

export const findExample = async (id: string) => prisma.example.findUnique({ where: { id } });

export const updateExample = async (transaction: AuditedTransaction, id: string) => {
	const client = getTransactionClient(transaction);
	await client.recipient.update({ where: { id }, data: {} });
	await client.$executeRaw\`UPDATE example SET name = 'x'\`;
	return getTransactionClient(transaction).example.delete({ where: { id } });
};

export const deletePhoneIfOrphaned = async (id: string) =>
	unauditedWrite('orphan-cleanup', () => prisma.phone.delete({ where: { id } }));
`,
	});

	assert.deepEqual(messages, []);
});

test('audited-writes rejects unaudited writes in enforced repositories', () => {
	const messages = lint({
		filename: 'src/modules/example/example.repository.ts',
		rules: auditedWritesRule({ requireAuditedWrites: true }),
		code: `import { prisma as db } from '@/lib/database/prisma';

export const updateExample = async (id: string) => db.example.update({ where: { id }, data: {} });

export const deleteExample = async (id: string) =>
	db.$transaction(async (transaction) => {
		await transaction.example.deleteMany({ where: { id } });
	});

export const rawExample = async () => db.$executeRawUnsafe('DELETE FROM example');
`,
	});

	assert.deepEqual(messageIds(messages), ['unauditedWrite', 'rawTransaction', 'unauditedWrite', 'unauditedWrite']);
});

test('audited-writes protects audited models everywhere, even inside unauditedWrite', () => {
	const messages = lint({
		filename: 'src/modules/legacy/legacy.repository.ts',
		rules: auditedWritesRule(),
		code: `import { prisma } from '@/lib/database/prisma';
import { unauditedWrite } from '@/lib/database/unaudited-write';

export const updateLegacy = async (id: string) => prisma.legacy.update({ where: { id }, data: {} });

export const removeLegacyRecipients = async (programId: string) =>
	prisma.$transaction(async (transaction) => {
		await transaction.recipient.updateMany({ where: { programId }, data: { programId: null } });
	});

export const deleteRecipient = async (id: string) =>
	unauditedWrite('orphan-cleanup', () => prisma.recipient.delete({ where: { id } }));
`,
	});

	assert.deepEqual(messageIds(messages), ['auditedModelWrite', 'auditedModelWrite']);
});

test('audited-writes keeps audit events append-only and audit internals private', () => {
	const repositoryMessages = lint({
		filename: 'src/modules/example/example.repository.ts',
		rules: auditedWritesRule({ requireAuditedWrites: true }),
		code: `import { getTransactionClient, runAuditedTransaction, type AuditedTransaction } from '@/lib/database/audited-transaction';

export const deleteAuditEvents = async (transaction: AuditedTransaction) =>
	getTransactionClient(transaction).auditEvent.deleteMany({});
`,
	});
	const serviceMessages = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: auditedWritesRule(),
		code: `import { getTransactionClient, insertAuditEvents } from '@/lib/database/audited-transaction';
`,
	});

	assert.deepEqual(messageIds(repositoryMessages), ['auditInternalImport', 'auditEventWrite']);
	assert.deepEqual(messageIds(serviceMessages), ['transactionClientImport', 'auditInternalImport']);
});
