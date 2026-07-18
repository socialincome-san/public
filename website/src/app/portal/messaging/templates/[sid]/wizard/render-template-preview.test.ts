import type { ParsedVariable, VariableAssignments } from '@/lib/services/twilio/messaging/twilio-messaging.types';
import { renderTemplatePreview } from './render-template-preview';

const vars = (entries: [string, string | null][]): ParsedVariable[] =>
	entries.map(([key, exampleValue]) => ({ key, exampleValue }));

describe('renderTemplatePreview', () => {
	test('returns empty string when body is empty', () => {
		expect(renderTemplatePreview('', [], {})).toBe('');
	});

	test('returns body unchanged when there are no variables', () => {
		expect(renderTemplatePreview('Hello world', [], {})).toBe('Hello world');
	});

	test('substitutes a constant-source assignment with the literal value', () => {
		const assignments: VariableAssignments = {
			name: { source: 'constant', value: 'Ada' },
		};
		expect(renderTemplatePreview('Hi {{name}}', vars([['name', null]]), assignments)).toBe('Hi Ada');
	});

	test('leaves field-source variables as their {{key}} placeholder', () => {
		const assignments: VariableAssignments = {
			first_name: { source: 'field', path: 'contact.firstName' },
		};
		expect(renderTemplatePreview('Hi {{first_name}}', vars([['first_name', 'Grace']]), assignments)).toBe(
			'Hi {{first_name}}',
		);
	});

	test('leaves field-source variables unchanged regardless of exampleValue', () => {
		const assignments: VariableAssignments = {
			first_name: { source: 'field', path: 'contact.firstName' },
		};
		expect(renderTemplatePreview('Hi {{first_name}}', vars([['first_name', null]]), assignments)).toBe('Hi {{first_name}}');
	});

	test('leaves unassigned variable tokens unchanged (defensive)', () => {
		expect(renderTemplatePreview('Hi {{name}}', vars([['name', 'Ada']]), {})).toBe('Hi {{name}}');
	});

	test('substitutes the same key multiple times', () => {
		const assignments: VariableAssignments = {
			name: { source: 'constant', value: 'Ada' },
		};
		expect(renderTemplatePreview('{{name}} and {{name}}', vars([['name', null]]), assignments)).toBe('Ada and Ada');
	});

	test('handles whitespace around variable key', () => {
		const assignments: VariableAssignments = {
			name: { source: 'constant', value: 'Ada' },
		};
		expect(renderTemplatePreview('Hi {{  name  }}', vars([['name', null]]), assignments)).toBe('Hi Ada');
	});

	test('substitutes constants and leaves field-source variables as placeholders', () => {
		const assignments: VariableAssignments = {
			first_name: { source: 'constant', value: 'Ada' },
			amount: { source: 'field', path: 'contributions.amount' },
		};
		expect(
			renderTemplatePreview(
				'Hi {{first_name}}, you donated {{amount}}',
				vars([
					['first_name', null],
					['amount', '100 CHF'],
				]),
				assignments,
			),
		).toBe('Hi Ada, you donated {{amount}}');
	});
});
