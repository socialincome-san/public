export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
export type Size = (typeof SIZES)[number];
