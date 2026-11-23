import type { PersonCircle } from '@/lib/storyblok/storyblok-utils';
import { pickPillCircle } from './people-pill.utils';

const circle = (code: string, status: PersonCircle['status'] = 'active'): PersonCircle => ({
	code,
	label: `${code} Circle`,
	status,
});

describe('pickPillCircle', () => {
	const circles = [circle('Technology'), circle('Operation'), circle('Finance'), circle('Communication', 'interested')];

	it('names the first active circle and counts the other active ones', () => {
		expect(pickPillCircle(circles)).toEqual({ label: 'Technology Circle', moreCount: 2 });
	});

	it('names the circle of the page it is shown on', () => {
		expect(pickPillCircle(circles, 'operation')).toEqual({ label: 'Operation Circle', moreCount: 2 });
	});

	it('falls back to the first circle on the page of a circle the person is not active in', () => {
		expect(pickPillCircle(circles, 'communication')).toEqual({ label: 'Technology Circle', moreCount: 2 });
	});

	it('counts nothing more for a single circle', () => {
		expect(pickPillCircle([circle('Finance')])).toEqual({ label: 'Finance Circle', moreCount: 0 });
	});

	it('returns null without an active circle', () => {
		expect(pickPillCircle([circle('Communication', 'interested')])).toBeNull();
	});
});
