import Image from 'next/image';
import { cn } from '../../../cn';
import { type WalletImage } from './wallet.types';

export const WALLET_IMAGE_SIZES = '(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw';

// On hover the stack fans out of the pocket: each image a little higher than the one behind it, the front one tilting
// left, the middle one peeking out on the right and the back one on the left.
const hoverMotionClasses = {
	back: 'group-hover:-translate-y-3 group-hover:-rotate-6',
	// Nudged right so its bottom corner stays behind the front image.
	middle: 'group-hover:translate-x-0.5 group-hover:-translate-y-5 group-hover:rotate-3',
	front: 'group-hover:-translate-y-6 group-hover:-rotate-2',
};

type WalletLayerImageProps = {
	image: WalletImage;
	decorative?: boolean;
	sizes: string;
	hoverMotion: keyof typeof hoverMotionClasses;
};

export const WalletLayerImage = ({ image, decorative = false, sizes, hoverMotion }: WalletLayerImageProps) => (
	<div
		className={cn(
			// Reaches below the pocket like a real photo, so lifting it shows more of itself, never the image behind.
			// It turns around the pocket line, so its edge there keeps the same frame on both sides.
			'absolute inset-x-0 top-0 -bottom-12 origin-[50%_calc(100%-3rem)] rounded-sm',
			'transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transform-none motion-reduce:transition-none',
			hoverMotionClasses[hoverMotion],
		)}
		aria-hidden={decorative ? true : undefined}
	>
		<Image src={image.src} alt={decorative ? '' : image.alt} fill sizes={sizes} className="rounded-sm object-cover" />
	</div>
);
