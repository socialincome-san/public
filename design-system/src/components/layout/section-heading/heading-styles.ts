export type HeadingSize = 1 | 2 | 3 | 4 | 5 | 6;

export const headingStyles: Record<HeadingSize, string> = {
	1: 'text-5xl wrap-anywhere hyphens-auto md:text-6xl',
	2: 'text-4xl wrap-anywhere hyphens-auto md:text-5xl',
	3: 'text-3xl wrap-anywhere hyphens-auto md:text-4xl',
	4: 'text-2xl wrap-anywhere hyphens-auto md:text-3xl',
	5: 'text-xl wrap-anywhere hyphens-auto md:text-2xl',
	6: 'text-lg wrap-anywhere hyphens-auto md:text-xl',
};
