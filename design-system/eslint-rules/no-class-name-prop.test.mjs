import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import classNamePlugin from './no-class-name-prop.mjs';

const designSystemRoot = path.resolve(import.meta.dirname, '..');

const lint = (code) => {
	const linter = new Linter({ configType: 'flat', cwd: designSystemRoot });

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
						projectService: { allowDefaultProject: ['*.tsx'] },
						tsconfigRootDir: designSystemRoot,
					},
				},
				plugins: {
					'design-system': classNamePlugin,
				},
				rules: {
					'design-system/no-class-name-prop': 'error',
				},
			},
		],
		{ filename: path.join(designSystemRoot, 'fixture.tsx') },
	);
};

const reportedNames = (messages) => messages.map(({ message }) => message.match(/^"(\w+)"/)?.[1]);

test('allows components with explicit variant props', () => {
	const messages = lint(`import * as React from 'react';
type Size = 's' | 'm' | 'l';
export const Box = ({ size }: { size: Size }) => <div className={size} />;
export const Item = React.forwardRef<HTMLDivElement, { label: string }>(({ label }, ref) => <div ref={ref}>{label}</div>);
export function Panel({ children }: { children: React.ReactNode }) {
	return <section className="p-4">{children}</section>;
}
`);

	assert.deepEqual(messages, []);
});

test('allows spreading HTML props when className is omitted', () => {
	const messages = lint(`import * as React from 'react';
type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => <button ref={ref} className="btn" {...props} />);
`);

	assert.deepEqual(messages, []);
});

test('rejects components that declare className', () => {
	const messages = lint(`import * as React from 'react';
export const Box = ({ className }: { className?: string }) => <div className={className} />;
export function Panel(props: { className: string }) {
	return <section className={props.className} />;
}
`);

	assert.deepEqual(reportedNames(messages), ['Box', 'Panel']);
});

test('rejects components that inherit className from HTML or third-party props', () => {
	const messages = lint(`import * as React from 'react';
type CardProps = React.HTMLAttributes<HTMLDivElement> & { tone: 'light' | 'dark' };
export const Card = ({ tone, ...props }: CardProps) => <div data-tone={tone} {...props} />;
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
	<button ref={ref} {...props} />
));
export const Label = React.memo((props: React.ComponentProps<'label'>) => <label {...props} />);
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ type, ...props }, ref) => (
	<input ref={ref} type={type} {...props} />
));
`);

	assert.deepEqual(reportedNames(messages), ['Card', 'Button', 'Label', 'Input']);
});

test('rejects className escape hatches with a prefix', () => {
	const messages =
		lint(`export const Map = ({ imageClassName }: { imageClassName?: string }) => <img className={imageClassName} />;
`);

	assert.deepEqual(reportedNames(messages), ['Map']);
	assert.match(messages[0].message, /must not accept imageClassName/);
});

test('rejects anonymous default-exported components', () => {
	const functionMessages = lint(`export default function ({ className }: { className?: string }) {
	return <div className={className} />;
}
`);
	const arrowMessages = lint(`export default ({ className }: { className?: string }) => <div className={className} />;
`);

	assert.match(functionMessages[0]?.message ?? '', /"default export" must not accept className/);
	assert.match(arrowMessages[0]?.message ?? '', /"default export" must not accept className/);
});

test('rejects className on one member of a props union', () => {
	const messages = lint(`type Props = { kind: 'a' } | { kind: 'b'; className?: string };
export const Choice = (props: Props) => <div>{props.kind}</div>;
`);

	assert.deepEqual(reportedNames(messages), ['Choice']);
});

test('ignores non-component functions and component-typed props', () => {
	const messages = lint(`import * as React from 'react';
const toClassName = (input: { className: string }) => input.className;
export const Menu = ({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) => <Icon className={toClassName({ className: 'size-4' })} />;
`);

	assert.deepEqual(messages, []);
});
