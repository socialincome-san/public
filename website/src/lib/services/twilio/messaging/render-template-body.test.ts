import { buildContentVariables, renderTemplateBody, type RenderableContact } from './render-template-body';
import type { ParsedVariable } from './twilio-messaging.types';

const contact: RenderableContact = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	callingName: null,
	email: 'ada@example.com',
	gender: null,
	language: 'en',
	dateOfBirth: null,
	profession: 'mathematician',
};

const variables: ParsedVariable[] = [
	{ key: '1', exampleValue: 'Hello' },
	{ key: '2', exampleValue: 'World' },
];

describe('renderTemplateBody', () => {
	test('renders constants verbatim', () => {
		const out = renderTemplateBody('Hi {{1}}', variables, { '1': { source: 'constant', value: 'Friend' } }, contact);
		expect(out).toBe('Hi Friend');
	});

	test('renders field paths against the contact', () => {
		const out = renderTemplateBody('Hi {{1}}', variables, { '1': { source: 'field', path: 'contact.firstName' } }, contact);
		expect(out).toBe('Hi Ada');
	});

	test('renders multiple variables', () => {
		const out = renderTemplateBody(
			'{{1}} {{2}}',
			variables,
			{
				'1': { source: 'field', path: 'contact.firstName' },
				'2': { source: 'constant', value: 'L.' },
			},
			contact,
		);
		expect(out).toBe('Ada L.');
	});

	test('renders empty string for missing field values', () => {
		const out = renderTemplateBody('Hi {{1}}', variables, { '1': { source: 'field', path: 'contact.gender' } }, contact);
		expect(out).toBe('Hi ');
	});

	test('renders empty string for unassigned variables', () => {
		const out = renderTemplateBody('Hi {{1}}', variables, {}, contact);
		expect(out).toBe('Hi ');
	});

	test('formats dateOfBirth as ISO date', () => {
		const c: RenderableContact = { ...contact, dateOfBirth: new Date('1990-04-12T00:00:00Z') };
		const out = renderTemplateBody('Born {{1}}', variables, { '1': { source: 'field', path: 'contact.dateOfBirth' } }, c);
		expect(out).toBe('Born 1990-04-12');
	});
});

describe('buildContentVariables', () => {
	test('produces a map keyed by variable key with resolved strings', () => {
		const map = buildContentVariables(
			variables,
			{
				'1': { source: 'field', path: 'contact.firstName' },
				'2': { source: 'constant', value: 'L.' },
			},
			contact,
		);
		expect(map).toEqual({ '1': 'Ada', '2': 'L.' });
	});

	test('emits empty strings for unassigned and missing-field variables', () => {
		const map = buildContentVariables(variables, { '1': { source: 'field', path: 'contact.gender' } }, contact);
		expect(map).toEqual({ '1': '', '2': '' });
	});
});
