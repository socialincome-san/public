import { Player } from '@lottiefiles/react-lottie-player';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

import file from './si-logo-animation.json';

export function SIAnimatedLogo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <Player src={file} autoplay keepLastFrame className={twMerge('[&>svg]:!w-auto', className)} {...props} />;
}
