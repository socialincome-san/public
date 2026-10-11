import {
	buildTwilioContentVariables,
	parseTwilioTemplateVariables,
	renderTwilioTemplateBody,
	type TwilioTemplateContact,
} from './twilio-template.integration';

const contact: TwilioTemplateContact = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	callingName: null,
	email: 'ada@example.com',
	gender: null,
	language: 'en',
	dateOfBirth: new Date('1815-12-10T00:00:00.000Z'),
	profession: 'mathematician',
};

describe('Twilio template mappers', () => {
	test('parses variables once in body order and preserves string examples', () => {
		expect(parseTwilioTemplateVariables('Hi {{1}} {{ name }} {{1}}', { '1': 'Ada', name: 42 })).toEqual([
			{ key: '1', exampleValue: 'Ada' },
			{ key: 'name', exampleValue: null },
		]);
	});

	test('renders constants, contact fields, dates, and missing values', () => {
		const assignments = {
			'1': { source: 'field', path: 'contact.firstName' },
			'2': { source: 'field', path: 'contact.dateOfBirth' },
			'3': { source: 'constant', value: 'friend' },
		} as const;

		expect(renderTwilioTemplateBody('{{1}} was born {{2}}, {{3}} {{4}}', assignments, contact)).toBe(
			'Ada was born 1815-12-10, friend ',
		);
		expect(
			buildTwilioContentVariables(
				[
					{ key: '1', exampleValue: null },
					{ key: '4', exampleValue: null },
				],
				assignments,
				contact,
			),
		).toEqual({ '1': 'Ada', '4': '' });
	});
});
