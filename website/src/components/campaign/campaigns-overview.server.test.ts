import { getStateQuery } from './campaigns-overview.server';

describe('campaigns-overview.server', () => {
	test('getStateQuery defaults to active when missing or invalid', () => {
		expect(getStateQuery()).toBe('active');
		expect(getStateQuery({})).toBe('active');
		expect(getStateQuery({ state: 'unknown' })).toBe('active');
		expect(getStateQuery({ state: ['unknown'] })).toBe('active');
	});

	test('getStateQuery accepts active, inactive, and all', () => {
		expect(getStateQuery({ state: 'active' })).toBe('active');
		expect(getStateQuery({ state: 'inactive' })).toBe('inactive');
		expect(getStateQuery({ state: 'all' })).toBe('all');
		expect(getStateQuery({ state: ['inactive'] })).toBe('inactive');
	});
});
