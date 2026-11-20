import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import { getPersonNeighbors } from './person-neighbors';

const person = (uuid: string, firstName: string, lastName = '') =>
	({ uuid, content: { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() } }) as ISbStoryData<Person>;

const persons = [
	person('c', 'Chidi', 'Okafor'),
	person('a', 'Ada', 'Lovelace'),
	person('z', 'Émile', 'Zola'),
	person('b', 'Bea'),
];
const uuids = (neighbors: ReturnType<typeof getPersonNeighbors>) =>
	neighbors && [neighbors.previous.uuid, neighbors.next.uuid];

describe('getPersonNeighbors', () => {
	it('orders people by first name', () => {
		expect(uuids(getPersonNeighbors(persons, 'b', 'en'))).toEqual(['a', 'c']);
		expect(uuids(getPersonNeighbors(persons, 'c', 'fr'))).toEqual(['b', 'z']);
	});

	it('wraps around at both ends', () => {
		expect(uuids(getPersonNeighbors(persons, 'a', 'en'))).toEqual(['z', 'b']);
		expect(uuids(getPersonNeighbors(persons, 'z', 'en'))).toEqual(['c', 'a']);
	});

	it('orders people with the same first name by last name', () => {
		const sameName = [person('2', 'Ada', 'Young'), person('1', 'Ada', 'Byron'), person('3', 'Zoe')];

		expect(uuids(getPersonNeighbors(sameName, '1', 'en'))).toEqual(['3', '2']);
	});

	it('has no neighbors for someone who is alone or not in the list', () => {
		expect(getPersonNeighbors([person('a', 'Ada')], 'a', 'en')).toBeNull();
		expect(getPersonNeighbors(persons, 'unknown', 'en')).toBeNull();
	});
});
