import { clearAssignment, emptyAssignments, getAssignment, setConstantSource, setFieldSource } from './variable-assignments';

describe('variable-assignments', () => {
	describe('emptyAssignments', () => {
		test('returns an empty record', () => {
			expect(emptyAssignments()).toEqual({});
		});
	});

	describe('setFieldSource', () => {
		test('adds a field assignment for a new key', () => {
			const next = setFieldSource({}, 'first_name', 'contact.firstName');
			expect(next).toEqual({ first_name: { source: 'field', path: 'contact.firstName' } });
		});

		test('overwrites an existing assignment on the same key', () => {
			const prev = { first_name: { source: 'constant' as const, value: 'Ada' } };
			const next = setFieldSource(prev, 'first_name', 'contact.firstName');
			expect(next.first_name).toEqual({ source: 'field', path: 'contact.firstName' });
		});

		test('does not mutate the input', () => {
			const prev = { first_name: { source: 'constant' as const, value: 'Ada' } };
			setFieldSource(prev, 'first_name', 'contact.firstName');
			expect(prev.first_name).toEqual({ source: 'constant', value: 'Ada' });
		});
	});

	describe('setConstantSource', () => {
		test('adds a constant assignment for a new key', () => {
			const next = setConstantSource({}, 'first_name', 'Ada');
			expect(next).toEqual({ first_name: { source: 'constant', value: 'Ada' } });
		});

		test('overwrites an existing assignment on the same key', () => {
			const prev = { first_name: { source: 'field' as const, path: 'contact.firstName' } };
			const next = setConstantSource(prev, 'first_name', 'Ada');
			expect(next.first_name).toEqual({ source: 'constant', value: 'Ada' });
		});

		test('does not mutate the input', () => {
			const prev = { first_name: { source: 'field' as const, path: 'contact.firstName' } };
			setConstantSource(prev, 'first_name', 'Ada');
			expect(prev.first_name).toEqual({ source: 'field', path: 'contact.firstName' });
		});

		test('supports empty string as constant value', () => {
			const next = setConstantSource({}, 'first_name', '');
			expect(next).toEqual({ first_name: { source: 'constant', value: '' } });
		});
	});

	describe('clearAssignment', () => {
		test('removes the key from the record', () => {
			const prev = { first_name: { source: 'field' as const, path: 'contact.firstName' } };
			const next = clearAssignment(prev, 'first_name');
			expect(next).toEqual({});
		});

		test('is a no-op when the key is absent', () => {
			const prev = { other: { source: 'constant' as const, value: 'x' } };
			const next = clearAssignment(prev, 'first_name');
			expect(next).toEqual(prev);
		});

		test('does not mutate the input', () => {
			const prev = { first_name: { source: 'field' as const, path: 'contact.firstName' } };
			clearAssignment(prev, 'first_name');
			expect(prev.first_name).toEqual({ source: 'field', path: 'contact.firstName' });
		});
	});

	describe('getAssignment', () => {
		test('returns null when the key is absent', () => {
			expect(getAssignment({}, 'first_name')).toBeNull();
		});

		test('returns the assignment when the key is present', () => {
			const prev = { first_name: { source: 'field' as const, path: 'contact.firstName' } };
			expect(getAssignment(prev, 'first_name')).toEqual({ source: 'field', path: 'contact.firstName' });
		});
	});
});
