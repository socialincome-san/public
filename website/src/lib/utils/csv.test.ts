import { Gender } from '@/generated/prisma/enums';
import { parseCsvOptionalFields, parseCsvText } from './csv';

type TestCase = {
	name: string;
	input: string;
	expected?: Record<string, string>[];
	error?: string;
};

const VALID_TEST_CASES: TestCase[] = [
	{
		name: 'parses simple CSV with two rows',
		input: `
			name,age
			Alice,30
			Bob,25
		`,
		expected: [
			{ name: 'Alice', age: '30' },
			{ name: 'Bob', age: '25' },
		],
	},
	{
		name: 'trims whitespace in headers and values',
		input: `
			name , age
			Alice , 30
		`,
		expected: [{ name: 'Alice', age: '30' }],
	},
	{
		name: 'allows empty values',
		input: `
			name,age
			Alice,
		`,
		expected: [{ name: 'Alice', age: '' }],
	},
];

const INVALID_TEST_CASES: TestCase[] = [
	{
		name: 'throws if CSV has only header',
		input: `
			name,age
		`,
		error: 'CSV must contain a header row and at least one data row.',
	},
	{
		name: 'throws if row has too few columns',
		input: `
			name,age
			Alice
		`,
		error: 'Row 2 has an invalid number of columns.',
	},
	{
		name: 'throws if row has too many columns',
		input: `
			name,age
			Alice,30,extra
		`,
		error: 'Row 2 has an invalid number of columns.',
	},
];

describe('parseCsvText', () => {
	VALID_TEST_CASES.forEach(({ name, input, expected }) => {
		test(name, () => {
			const result = parseCsvText(input);
			expect(result).toEqual(expected);
		});
	});

	INVALID_TEST_CASES.forEach(({ name, input, error }) => {
		test(name, () => {
			expect(() => parseCsvText(input)).toThrow(error);
		});
	});
});

describe('parseCsvOptionalFields', () => {
	test('parses valid optional fields', () => {
		const result = parseCsvOptionalFields(1, {
			contactPhone: ' +23277000111 ',
			paymentPhone: '+23277000112',
			dateOfBirth: '1991-04-21',
			gender: 'FEMALE',
			paymentInformationCode: ' code-1 ',
		});

		expect(result).toEqual({
			success: true,
			data: {
				contactPhone: '+23277000111',
				paymentPhone: '+23277000112',
				dateOfBirth: new Date(Date.UTC(1991, 3, 21, 12)),
				gender: Gender.female,
				paymentInformationCode: 'code-1',
			},
			status: undefined,
		});
	});

	test('returns an error for invalid gender', () => {
		const result = parseCsvOptionalFields(1, {
			contactPhone: '',
			paymentPhone: '',
			dateOfBirth: '',
			gender: 'unknown',
			paymentInformationCode: '',
		});

		expect(result).toEqual({
			success: false,
			error: 'Row 1: gender must be one of male, female, other, private (case-insensitive)',
			status: undefined,
		});
	});

	test('returns an error for invalid dateOfBirth', () => {
		const result = parseCsvOptionalFields(1, {
			contactPhone: '',
			paymentPhone: '',
			dateOfBirth: '1990-02-30',
			gender: '',
			paymentInformationCode: '',
		});

		expect(result).toEqual({
			success: false,
			error: 'Row 1: dateOfBirth must be a valid date in YYYY-MM-DD format',
			status: undefined,
		});
	});
});
