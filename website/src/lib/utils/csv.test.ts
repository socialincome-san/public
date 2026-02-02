import { parseCsvText } from './csv';

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
