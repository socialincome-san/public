import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			text: ['display', 'display-lg'],
			shadow: ['card', 'raised', 'overlay', 'dock', 'backstage'],
			ease: ['glide', 'orbit'],
			'drop-shadow': ['card', 'on-media'],
			radius: ['control'],
		},
	},
});

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};
