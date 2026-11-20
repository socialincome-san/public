import {
	getActiveDiscAngles,
	getDiscPosition,
	limitActiveDiscs,
	limitInterestedDiscs,
	PERSON_CIRCLES_GEOMETRY,
} from './person-circles-geometry';

describe('getActiveDiscAngles', () => {
	it.each([
		[0, []],
		[1, [35]],
		[2, [0, 70]],
		[3, [-25, 35, 95]],
		[4, [-35, 20, 75, 130]],
		[5, [-50, -2.5, 45, 92.5, 140]],
		[6, [-50, -12, 26, 64, 102, 140]],
	])('places %i discs', (count, angles) => {
		expect(getActiveDiscAngles(count)).toEqual(angles);
	});

	it('never places more than six discs', () => {
		expect(getActiveDiscAngles(9)).toHaveLength(6);
		expect(getActiveDiscAngles(-2)).toEqual([]);
	});
});

describe('limitActiveDiscs', () => {
	it('shows up to six circles', () => {
		expect(limitActiveDiscs([1, 2, 3, 4, 5, 6])).toEqual({ shown: [1, 2, 3, 4, 5, 6], moreCount: 0 });
	});

	it('shows five and counts the rest from seven on', () => {
		expect(limitActiveDiscs([1, 2, 3, 4, 5, 6, 7, 8])).toEqual({ shown: [1, 2, 3, 4, 5], moreCount: 3 });
	});
});

describe('limitInterestedDiscs', () => {
	it('shows two circles, or one and the count of the rest', () => {
		expect(limitInterestedDiscs(['a', 'b'])).toEqual({ shown: ['a', 'b'], moreCount: 0 });
		expect(limitInterestedDiscs(['a', 'b', 'c'])).toEqual({ shown: ['a'], moreCount: 2 });
	});
});

describe('getDiscPosition', () => {
	const { width, height, centerX, centerY, active, interested } = PERSON_CIRCLES_GEOMETRY;

	it('puts a disc without distance on the portrait center', () => {
		expect(getDiscPosition(0, 0)).toEqual({ left: (centerX / width) * 100, top: (centerY / height) * 100 });
	});

	it('goes right at 0° and down at 90°', () => {
		expect(getDiscPosition(0, 1).left).toBeCloseTo(((centerX + 1) / width) * 100);
		expect(getDiscPosition(90, 1).top).toBeCloseTo(((centerY + 1) / height) * 100);
	});

	it('keeps every disc inside the frame at every angle of its orbit', () => {
		const reaches = [
			active.distance + active.largeDiameter / 2,
			active.distance + active.diameter / 2,
			interested.distance + interested.diameter / 2,
		];
		const room = Math.min(centerX, width - centerX, centerY, height - centerY);

		for (const reach of reaches) {
			expect(reach).toBeLessThanOrEqual(room);
		}
	});
});
