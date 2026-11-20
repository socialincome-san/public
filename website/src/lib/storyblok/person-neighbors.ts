import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';

type PersonStory = ISbStoryData<Person>;

const sortKey = ({ content }: PersonStory) => `${content.firstName} ${content.lastName}`.trim() || content.fullName;

// The order people are stepped through on their pages. Change it here to change it everywhere.
const sortPersons = (persons: PersonStory[], language: string) =>
	[...persons].sort(
		(left, right) => sortKey(left).localeCompare(sortKey(right), language) || left.uuid.localeCompare(right.uuid),
	);

/** The people before and after a person, alphabetically by first name. The list wraps around at both ends. */
export const getPersonNeighbors = (persons: PersonStory[], personUuid: string, language: string) => {
	const sorted = sortPersons(persons, language);
	const index = sorted.findIndex((person) => person.uuid === personUuid);
	if (index === -1 || sorted.length < 2) {
		return null;
	}

	return {
		previous: sorted[(index - 1 + sorted.length) % sorted.length],
		next: sorted[(index + 1) % sorted.length],
	};
};
