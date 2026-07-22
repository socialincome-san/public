import type {
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
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

	test('renders field-source variables as their bracketed field path', () => {
		const assignments: VariableAssignments = {
			first_name: { source: 'field', path: 'contact.firstName' },
		};
		expect(renderTemplatePreview('Hi {{first_name}}', vars([['first_name', 'Grace']]), assignments)).toBe(
			'Hi [contact.firstName]',
		);
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

	test('substitutes constants and renders field-source variables as bracketed paths', () => {
		const assignments: VariableAssignments = {
			first_name: { source: 'constant', value: 'Ada' },
			email: { source: 'field', path: 'contact.email' },
		};
		expect(
			renderTemplatePreview(
				'Hi {{first_name}}, we will reach you at {{email}}',
				vars([
					['first_name', null],
					['email', null],
				]),
				assignments,
			),
		).toBe('Hi Ada, we will reach you at [contact.email]');
	});
});
