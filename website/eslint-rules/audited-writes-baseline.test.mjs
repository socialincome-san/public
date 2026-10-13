import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditedModels, unauditedLegacyRepositories } from './audited-writes-baseline.mjs';
import backendArchitecturePlugin from './backend-architecture.mjs';

const websiteRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const repositoriesWithUnauditedWrites = () => {
	const linter = new Linter({ configType: 'flat' });

	return globSync('src/modules/**/*.repository.ts', { cwd: websiteRoot })
		.filter((filename) => {
			const messages = linter.verify(
				readFileSync(path.join(websiteRoot, filename), 'utf8'),
				[
					{
						files: ['**/*.ts'],
						languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
						plugins: { 'backend-architecture': backendArchitecturePlugin },
						rules: {
							'backend-architecture/audited-writes': ['error', { auditedModels, requireAuditedWrites: true }],
						},
					},
				],
				{ filename },
			);

			return messages.length > 0;
		})
		.sort();
};

test('the unaudited legacy baseline lists exactly the repositories with unaudited writes', () => {
	assert.deepEqual(
		repositoriesWithUnauditedWrites(),
		[...unauditedLegacyRepositories].sort(),
		'A repository left the baseline without migrating to withAudit, or a migrated repository is still listed. Update eslint-rules/audited-writes-baseline.mjs by removing entries only.',
	);
});
