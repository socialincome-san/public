// One unit is the radius of the portrait; every other measure of the composition follows from it
export const PERSON_CIRCLES_GEOMETRY = {
	// A square around the portrait, so the discs that reach furthest out stay inside at every point of their orbit
	width: 3.9,
	height: 3.9,
	centerX: 1.95,
	centerY: 1.95,
	ringRadii: [1.214, 1.464],
	active: { diameter: 0.943, distance: 1.25, largeDiameter: 1.2 },
	interested: { diameter: 0.8, distance: 1.536, angles: [185, 228] },
} as const;

const MAX_ACTIVE_DISCS = 6;
const MAX_INTERESTED_DISCS = 2;
const SPREAD_START = -50;
const SPREAD_END = 140;

// 0° points right, angles grow clockwise
const ACTIVE_ANGLES: Record<number, number[]> = {
	1: [35],
	2: [0, 70],
	3: [-25, 35, 95],
	4: [-35, 20, 75, 130],
};

/** Where the discs of the active circles sit around the portrait, for up to six discs. */
export const getActiveDiscAngles = (count: number): number[] => {
	const discs = Math.min(Math.max(Math.floor(count), 0), MAX_ACTIVE_DISCS);
	if (discs === 0) {
		return [];
	}
	const step = (SPREAD_END - SPREAD_START) / (discs - 1);

	return ACTIVE_ANGLES[discs] ?? Array.from({ length: discs }, (_, index) => SPREAD_START + index * step);
};

/** The items that get a disc of their own and how many are left for the "+N" disc, which takes the last place. */
const limitDiscs = <T>(items: T[], max: number): { shown: T[]; moreCount: number } =>
	items.length > max
		? { shown: items.slice(0, max - 1), moreCount: items.length - (max - 1) }
		: { shown: items, moreCount: 0 };

export const limitActiveDiscs = <T>(items: T[]) => limitDiscs(items, MAX_ACTIVE_DISCS);

export const limitInterestedDiscs = <T>(items: T[]) => limitDiscs(items, MAX_INTERESTED_DISCS);

/** The center of a disc in percent of the frame, for `left` and `top`. */
export const getDiscPosition = (angle: number, distance: number) => {
	const { width, height, centerX, centerY } = PERSON_CIRCLES_GEOMETRY;
	const radians = (angle * Math.PI) / 180;

	return {
		left: ((centerX + Math.cos(radians) * distance) / width) * 100,
		top: ((centerY + Math.sin(radians) * distance) / height) * 100,
	};
};
