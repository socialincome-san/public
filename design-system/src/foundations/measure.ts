import { useCallback, useState } from 'react';

// Foundation stories show the values the browser actually resolves, so the docs can't drift from the tokens.
// getComputedStyle returns a live declaration, so reading it during render always reflects the current styles.
export const useComputedStyle = () => {
	const [style, setStyle] = useState<CSSStyleDeclaration | null>(null);
	const ref = useCallback((element: HTMLElement | null) => {
		if (element) {
			setStyle(getComputedStyle(element));
		}
	}, []);

	return [ref, style] as const;
};

export const readRootToken = (name: string) =>
	typeof document === 'undefined' ? '' : getComputedStyle(document.documentElement).getPropertyValue(name).trim();

type Rgb = [number, number, number];

export const parseRgb = (value: string): Rgb | null => {
	const match = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);

	return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
};

export const toHex = ([red, green, blue]: Rgb) =>
	`#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

const relativeLuminance = (rgb: Rgb) => {
	const [red, green, blue] = rgb.map((channel) => {
		const normalized = channel / 255;

		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

export const contrastRatio = (first: Rgb, second: Rgb) => {
	const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);

	return (lighter + 0.05) / (darker + 0.05);
};

// WCAG 2.2: 4.5:1 for body text, 3:1 for large text (24px, or 18.66px bold) and UI components
export const contrastRating = (ratio: number) => {
	if (ratio >= 7) {
		return 'AAA';
	}
	if (ratio >= 4.5) {
		return 'AA';
	}
	if (ratio >= 3) {
		return 'AA large';
	}

	return 'Fail';
};
