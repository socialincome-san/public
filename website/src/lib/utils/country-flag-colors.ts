import type { CountryCode } from '@/generated/prisma/enums';
import { getFlagColorsFromSvg } from '@/lib/utils/country-flag-color';
import { WHITESPACE_REGEX } from '@/lib/utils/regex';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const flagColorsCache = new Map<string, string[]>();

export const getCountryFlagColors = (countryCode: CountryCode): string[] => {
	const cached = flagColorsCache.get(countryCode);
	if (cached) {
		return cached;
	}

	try {
		const slug = countryCode.toLowerCase().replace(WHITESPACE_REGEX, '_');
		const svg = readFileSync(path.join(process.cwd(), 'public/assets/flags', `${slug}.svg`), 'utf8');
		const colors = getFlagColorsFromSvg(svg);
		flagColorsCache.set(countryCode, colors);

		return colors;
	} catch {
		flagColorsCache.set(countryCode, []);

		return [];
	}
};
