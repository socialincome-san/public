import Image from 'next/image';
import { cn } from '../../../cn';
import { type WalletImage } from './wallet.types';

export const WALLET_IMAGE_SIZES = '(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw';

const hoverMotionClasses = {
	none: '',
	'tilt-right': 'group-hover:translate-x-1 group-hover:-translate-y-5 group-hover:rotate-[5deg]',
	'tilt-left': 'group-hover:-translate-x-1 group-hover:-translate-y-7 group-hover:-rotate-5',
};

type WalletLayerImageProps = {
	image: WalletImage;
	decorative?: boolean;
	sizes: string;
	hoverMotion?: keyof typeof hoverMotionClasses;
};

export const WalletLayerImage = ({ image, decorative = false, sizes, hoverMotion = 'none' }: WalletLayerImageProps) => (
	<div
		className={cn(
			'absolute inset-0 origin-bottom rounded-sm',
			hoverMotion !== 'none' &&
				'transition duration-300 ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none',
			hoverMotionClasses[hoverMotion],
		)}
		aria-hidden={decorative ? true : undefined}
	>
		<Image src={image.src} alt={decorative ? '' : image.alt} fill sizes={sizes} className="rounded-sm object-cover" />
	</div>
);
