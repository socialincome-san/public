import { readFileSync } from 'node:fs';
import path from 'node:path';
import { assignFlagColors, getRepresentativeFlagColor, MISSING_FLAG_COLOR } from './country-flag-color';
import { getCountryFlagColors } from './country-flag-colors';

const readFlag = (countryCode: string): string => {
	return readFileSync(path.join(process.cwd(), 'public/assets/flags', `${countryCode}.svg`), 'utf8');
};

describe('getRepresentativeFlagColor', () => {
	test('uses the distinctive fill from circular flag assets', () => {
		expect(getRepresentativeFlagColor(readFlag('ch'))).toBe('#D80027');
		expect(getRepresentativeFlagColor(readFlag('jp'))).toBe('#D80027');
		expect(getRepresentativeFlagColor(readFlag('se'))).toBe('#0052B4');
	});

	test('skips near-white flag fields', () => {
		expect(getRepresentativeFlagColor('<path fill="#F0F0F0"/><path fill="#6DA544"/>')).toBe('#6DA544');
	});

	test('falls back when a flag has no distinctive fills', () => {
		expect(getRepresentativeFlagColor('<path fill="#FFFFFF"/>')).toBe(MISSING_FLAG_COLOR);
	});
});

describe('assignFlagColors', () => {
	test('uses alternate flag colors so neighbouring countries are not all red', () => {
		const colors = assignFlagColors(['CH', 'FR', 'IT', 'SE'], getCountryFlagColors);

		expect(colors.get('CH')).toBe('#D80027');
		expect(colors.get('FR')).toBe('#0052B4');
		expect(colors.get('IT')).toBe('#6DA544');
		expect(colors.get('SE')).toBe('#FFDA44');
		expect(new Set(colors.values()).size).toBe(4);
	});

	test('shifts hue when two flags only share the same red', () => {
		const colors = assignFlagColors(['CH', 'JP'], getCountryFlagColors);

		expect(colors.get('CH')).toBe('#D80027');
		expect(colors.get('JP')).not.toBe('#D80027');
		expect(colors.get('JP')).toMatch(/^#[0-9A-F]{6}$/);
	});
});

describe('getCountryFlagColors', () => {
	test('reads the existing flag asset for a country code', () => {
		expect(getCountryFlagColors('CH')).toEqual(['#D80027']);
		expect(getCountryFlagColors('IT')).toEqual(['#D80027', '#6DA544']);
	});
});
