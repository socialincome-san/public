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

test('service-result-contract requires annotated ServiceResult returns', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/service-result-contract': 'error' },
		code: `import type { ServiceResult } from '@/lib/services/core/base.types';

export const createExample = async (): Promise<ServiceResult<{ id: string }>> => {
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
		rules: { 'backend-architecture/service-result-contract': 'error' },
		code: `export const createExample = async () => {
	return { id: '1' };
};
`,
	});
	assert.deepEqual(messageIds(invalid), ['missingResultType']);
});

test('service-result-contract allows sync integration helpers without ServiceResult', () => {
	const messages = lint({
		filename: 'src/integrations/example/example.integration.ts',
		rules: { 'backend-architecture/service-result-contract': 'error' },
		code: `import type { ServiceResult } from '@/lib/services/core/base.types';

export const mapExample = (value: string): string => value;

export const createExample = async (): Promise<ServiceResult<{ id: string }>> => {
	return { success: true, data: { id: '1' } };
};
`,
	});

	assert.deepEqual(messages, []);
});

test('safe-result-errors rejects JSON.stringify in resultFail messages', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/safe-result-errors': 'error' },
		code: `import { resultFail } from '@/lib/services/core/service-result';

export const failExample = () => resultFail('Could not create example');
`,
	});
	assert.deepEqual(valid, []);

	const invalid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/safe-result-errors': 'error' },
		code: `import { resultFail } from '@/lib/services/core/service-result';

export const failExample = (error: unknown) => resultFail(\`Could not create example: \${JSON.stringify(error)}\`);
`,
	});
	assert.deepEqual(messageIds(invalid), ['unsafeResultError']);
});

test('filename-contract enforces approved suffixes', () => {
	const valid = lint({
		filename: 'src/modules/example/example.service.ts',
		rules: { 'backend-architecture/filename-contract': 'error' },
		code: `export const createExample = async () => {};
`,
	});
	assert.deepEqual(valid, []);

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
