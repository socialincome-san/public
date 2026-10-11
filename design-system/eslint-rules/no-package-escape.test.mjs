import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import designSystemPlugin from './no-package-escape.mjs';

const designSystemRoot = path.resolve(import.meta.dirname, '..');
const buttonFile = path.join(designSystemRoot, 'src/components/actions/button/button.tsx');

const lint = (code, filename = buttonFile) => {
	const linter = new Linter({ configType: 'flat' });

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
					'design-system': designSystemPlugin,
				},
				rules: {
					'design-system/no-package-escape': 'error',
				},
			},
		],
		{ filename },
	);
};

test('allows imports that stay inside the design system', () => {
	const messages = lint(`import { cn } from '../../../cn';
import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';
import path from 'node:path';
export { Button } from './button';
`);

	assert.deepEqual(messages, []);
});

test('rejects website aliases and relative imports that leave the package', () => {
	const messages = lint(`import { cn } from '@/lib/utils/cn';
import { page } from '@socialincome/website/src/app/page';
import { flag } from '../../../../../website/public/assets/flags/ch.svg';
`);

	assert.equal(messages.length, 3);
	assert.ok(messages.every((entry) => entry.message.includes('cannot import the website')));
});

test('rejects packages that are not declared by the design system', () => {
	const messages = lint(`import { storyblokEditable } from '@storyblok/react';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
`);

	assert.equal(messages.length, 3);
	assert.ok(messages.every((entry) => entry.message.includes('is not declared in design-system/package.json')));
});
