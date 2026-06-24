import type { Spacer } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: Spacer;
};

const defaultSize = 'm';

const sizeClasses = {
	'': 'h-12 md:h-24 lg:h-32',
	xs: 'h-4 md:h-6 lg:h-8',
	s: 'h-8 md:h-12 lg:h-16',
	m: 'h-12 md:h-24 lg:h-32',
	l: 'h-16 md:h-32 lg:h-48',
	xl: 'h-24 md:h-48 lg:h-64',
} satisfies Record<NonNullable<Spacer['size']>, string>;

export const SpacerBlock = ({ blok }: Props) => {
	const size = blok.size ?? defaultSize;

	return (
		<div
			className={`storyblok__outline w-site-width max-w-content mx-auto ${sizeClasses[size]}`}
			aria-hidden
			{...storyblokEditable(blok as SbBlokData)}
		/>
	);
};
