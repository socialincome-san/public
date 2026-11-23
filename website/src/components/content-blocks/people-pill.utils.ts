import type { PersonCircle } from '@/lib/storyblok/storyblok-utils';
import { slugify } from '@/lib/utils/string-utils';

// The circle a pill names, and in how many more the person is active
export const pickPillCircle = (circles: PersonCircle[], pageCircleSlug?: string) => {
	const activeCircles = circles.filter((circle) => circle.status === 'active');
	// Memberships have no start date, so the first joined circle is the first one listed on the person
	const circle = activeCircles.find(({ code }) => slugify(code) === pageCircleSlug) ?? activeCircles[0];

	return circle ? { label: circle.label, moreCount: activeCircles.length - 1 } : null;
};
