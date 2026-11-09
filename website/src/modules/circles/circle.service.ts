import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getPersonCircles } from '@/lib/storyblok/storyblok-utils';
import { slugify } from '@/lib/utils/string-utils';
import * as storyblokContent from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import type { CircleSummary } from './circle.types';

const findCircleMembership = (person: ISbStoryData<Person>, circleSlug: string) =>
	getPersonCircles(person.content).find(({ code }) => slugify(code) === circleSlug);

// Former volunteers keep their circles on their profile, but no longer count as members
const isCircleMember = (person: ISbStoryData<Person>, circleSlug: string) =>
	person.content.volunteerStatus === 'active' && findCircleMembership(person, circleSlug) !== undefined;

export const getCircleSummaries = async (language: string): Promise<Result<CircleSummary[]>> => {
	try {
		const [circleLabelsResult, personsResult] = await Promise.all([
			storyblokContent.getCircleLabels(language),
			storyblokContent.getAllPersons(language),
		]);
		if (!circleLabelsResult.success || !personsResult.success) {
			return resultFail('Could not load circles');
		}

		const persons = personsResult.data;

		return resultOk(
			Object.entries(circleLabelsResult.data).map(([code, label]) => {
				const slug = slugify(code);
				const statuses = persons
					.filter((person) => isCircleMember(person, slug))
					.map((person) => findCircleMembership(person, slug)?.status);

				return {
					slug,
					label,
					activeCount: statuses.filter((status) => status === 'active').length,
					interestedCount: statuses.filter((status) => status === 'interested').length,
				};
			}),
		);
	} catch (error) {
		console.error('Could not load circles', { error });

		return resultFail('Could not load circles');
	}
};
