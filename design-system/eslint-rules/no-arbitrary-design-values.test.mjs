import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import test from 'node:test';
import designTokensPlugin from './no-arbitrary-design-values.mjs';

const lint = (code) =>
	new Linter({ configType: 'flat' }).verify(
		code,
		[
			{
				files: ['**/*.tsx'],
				languageOptions: {
					parser: tsParser,
					parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
				},
				plugins: { 'design-tokens': designTokensPlugin },
				rules: { 'design-tokens/no-arbitrary-design-values': 'error' },
			},
		],
		{ filename: 'fixture.tsx' },
	);

const reportedClasses = (messages) => messages.map(({ message }) => message.match(/^"([^"]+)"/)?.[1]);

test('allows tokens, token-based values and layout values', () => {
	const messages = lint(`
export const A = () => <div className="bg-card text-muted-foreground shadow-card rounded-4xl text-2xs drop-shadow-on-media" />;
export const B = () => <div className="from-[hsl(var(--gradient-card-from))] text-[0.45em] w-[400px] z-[110] bg-black/60 text-white" />;
export const classes = cva('max-h-[min(16rem,var(--radix-select-content-available-height))] [&_svg]:size-4');
`);

	assert.deepEqual(messages, []);
});

test('rejects Tailwind palette colors, including with variants and opacity', () => {
	const messages = lint(`
export const A = () => <div className="text-slate-600 hover:bg-cyan-950/50 md:border-green-300" />;
`);

	assert.deepEqual(reportedClasses(messages), ['text-slate-600', 'hover:bg-cyan-950/50', 'md:border-green-300']);
});

test('rejects arbitrary colors, font sizes, radii and shadows', () => {
	const messages = lint(`
const size = 'lg:text-[112px]';
export const A = () => (
	<div className={\`bg-[#fef8ee] text-[10px] rounded-b-[56px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] \${size}\`} />
);
`);

	assert.deepEqual(reportedClasses(messages), [
		'lg:text-[112px]',
		'bg-[#fef8ee]',
		'text-[10px]',
		'rounded-b-[56px]',
		'shadow-[0_2px_4px_rgba(0,0,0,0.05)]',
		'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
	]);
});

test('points to the matching foundation', () => {
	const [message] = lint(`export const A = () => <div className="rounded-[10px]" />;`);

	assert.match(message.message, /Foundations › Radius/);
});
