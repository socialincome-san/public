import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

import dynamic from 'next/dynamic';
import file from './si-logo-animation.json';

// Importing the Player component dynamically to avoid SSR issues (ReferenceError: document is not defined error)
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
	ssr: false,
});

export const SIAnimatedLogo = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
	return <Player src={file} autoplay keepLastFrame className={twMerge('[&>svg]:!w-auto', className)} {...props} />;
};
