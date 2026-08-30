export const INITIAL_GLOBE_VIEW = {
	lat: 38,
	lng: 10,
	altitude: 1.72,
} as const;

export const GLOBE_COLORS = {
	sphere: '#DFEBF2',
	hexagon: '#64748B',
} as const;

export const GLOBE_SPHERE_OPACITY = 0.95;
export const HEXAGON_RESOLUTION = 3;
export const HEXAGON_MARGIN = 0.65;
export const AUTO_ROTATE_SPEED = 1.5;
export const DAMPING_FACTOR = 0.05;
export const FALLBACK_VIEW_BOX_SIZE = 760;
