import type { CountryCode } from '@/generated/prisma/enums';

export const MISSING_FLAG_COLOR = 'hsl(var(--muted-foreground))';

const FLAG_FILL_REGEX = /\bfill="([^"]+)"/gi;
const HUE_COLLISION_DEGREES = 28;
const HUE_SHIFT_OFFSETS = [38, -34, 58, -54, 78, -74, 22, -22];

const NAMED_COLORS: Record<string, string> = {
	black: '#000000',
	white: '#FFFFFF',
	none: '',
	transparent: '',
};

type RgbColor = { r: number; g: number; b: number };
type HslColor = { h: number; s: number; l: number };

const parseHexColor = (value: string): RgbColor | null => {
	const named = NAMED_COLORS[value.toLowerCase()];
	const hex = (named ?? value).replace('#', '').toUpperCase();
	if (hex.length === 3) {
		const [red, green, blue] = hex.split('');
		if (!red || !green || !blue) {
			return null;
		}

		return {
			r: Number.parseInt(`${red}${red}`, 16),
			g: Number.parseInt(`${green}${green}`, 16),
			b: Number.parseInt(`${blue}${blue}`, 16),
		};
	}

	if (hex.length !== 6 || Number.isNaN(Number.parseInt(hex, 16))) {
		return null;
	}

	return {
		r: Number.parseInt(hex.slice(0, 2), 16),
		g: Number.parseInt(hex.slice(2, 4), 16),
		b: Number.parseInt(hex.slice(4, 6), 16),
	};
};

const toCssHex = (rgb: RgbColor): string => {
	const toChannel = (channel: number): string => channel.toString(16).padStart(2, '0').toUpperCase();

	return `#${toChannel(rgb.r)}${toChannel(rgb.g)}${toChannel(rgb.b)}`;
};

const isNearWhite = ({ r, g, b }: RgbColor): boolean => (r + g + b) / 3 >= 240;
const isNearBlack = ({ r, g, b }: RgbColor): boolean => (r + g + b) / 3 <= 25;

const rgbToHsl = ({ r, g, b }: RgbColor): HslColor => {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const lightness = (max + min) / 2;
	if (max === min) {
		return { h: 0, s: 0, l: lightness };
	}

	const delta = max - min;
	const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
	let hue = 0;
	if (max === red) {
		hue = (green - blue) / delta + (green < blue ? 6 : 0);
	} else if (max === green) {
		hue = (blue - red) / delta + 2;
	} else {
		hue = (red - green) / delta + 4;
	}

	return { h: hue * 60, s: saturation, l: lightness };
};

const hueToRgb = (p: number, q: number, t: number): number => {
	let tone = t;
	if (tone < 0) {
		tone += 1;
	}
	if (tone > 1) {
		tone -= 1;
	}
	if (tone < 1 / 6) {
		return p + (q - p) * 6 * tone;
	}
	if (tone < 1 / 2) {
		return q;
	}
	if (tone < 2 / 3) {
		return p + (q - p) * (2 / 3 - tone) * 6;
	}

	return p;
};

const hslToRgb = ({ h, s, l }: HslColor): RgbColor => {
	const hue = (((h % 360) + 360) % 360) / 360;
	if (s === 0) {
		const value = Math.round(l * 255);

		return { r: value, g: value, b: value };
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;

	return {
		r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
		g: Math.round(hueToRgb(p, q, hue) * 255),
		b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
	};
};

const hueDistance = (left: string, right: string): number => {
	const leftRgb = parseHexColor(left);
	const rightRgb = parseHexColor(right);
	if (!leftRgb || !rightRgb) {
		return 180;
	}

	const delta = Math.abs(rgbToHsl(leftRgb).h - rgbToHsl(rightRgb).h) % 360;

	return Math.min(delta, 360 - delta);
};

const minHueDistance = (color: string, usedColors: string[]): number => {
	if (usedColors.length === 0) {
		return 180;
	}

	return usedColors.reduce((minimum, used) => Math.min(minimum, hueDistance(color, used)), 180);
};

const shiftHexHue = (color: string, offset: number): string => {
	const rgb = parseHexColor(color);
	if (!rgb) {
		return color;
	}

	const hsl = rgbToHsl(rgb);

	return toCssHex(hslToRgb({ ...hsl, h: hsl.h + offset }));
};

export const getFlagColorsFromSvg = (svg: string): string[] => {
	const fills: string[] = [];

	for (const match of svg.matchAll(FLAG_FILL_REGEX)) {
		const rawFill = match[1];
		if (!rawFill) {
			continue;
		}

		const rgb = parseHexColor(rawFill);
		if (!rgb || isNearWhite(rgb)) {
			continue;
		}

		fills.push(toCssHex(rgb));
	}

	const chromaticFills = fills.filter((fill) => {
		const rgb = parseHexColor(fill);

		return rgb !== null && !isNearBlack(rgb);
	});
	const candidates = chromaticFills.length > 0 ? chromaticFills : fills;
	const counts = new Map<string, number>();
	for (const color of candidates) {
		counts.set(color, (counts.get(color) ?? 0) + 1);
	}

	return [...counts.entries()]
		.sort((left, right) => right[1] - left[1] || candidates.indexOf(left[0]) - candidates.indexOf(right[0]))
		.map(([color]) => color);
};

export const getRepresentativeFlagColor = (svg: string, fallback = MISSING_FLAG_COLOR): string => {
	return getFlagColorsFromSvg(svg)[0] ?? fallback;
};

const pickDiverseFlagColor = (candidates: string[], usedColors: string[], fallback = MISSING_FLAG_COLOR): string => {
	if (candidates.length === 0) {
		return fallback;
	}

	const ranked = [...candidates].sort((left, right) => minHueDistance(right, usedColors) - minHueDistance(left, usedColors));
	const bestNative = ranked[0] ?? fallback;
	if (minHueDistance(bestNative, usedColors) >= HUE_COLLISION_DEGREES) {
		return bestNative;
	}

	const baseColor = candidates[0] ?? fallback;
	let bestShifted = bestNative;
	let bestDistance = minHueDistance(bestNative, usedColors);
	for (const offset of HUE_SHIFT_OFFSETS) {
		const shifted = shiftHexHue(baseColor, offset);
		const distance = minHueDistance(shifted, usedColors);
		if (distance > bestDistance) {
			bestShifted = shifted;
			bestDistance = distance;
		}
		if (distance >= HUE_COLLISION_DEGREES) {
			return shifted;
		}
	}

	return bestShifted;
};

export const assignFlagColors = (
	countryCodes: CountryCode[],
	getColors: (countryCode: CountryCode) => string[],
	fallback = MISSING_FLAG_COLOR,
): Map<CountryCode, string> => {
	const assigned = new Map<CountryCode, string>();
	const usedColors: string[] = [];

	for (const countryCode of countryCodes) {
		const color = pickDiverseFlagColor(getColors(countryCode), usedColors, fallback);
		assigned.set(countryCode, color);
		usedColors.push(color);
	}

	return assigned;
};
