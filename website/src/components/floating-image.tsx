import { formatStoryblokResizeUrl, getScaledAssetDimensions } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { motion, MotionValue, useTransform } from 'motion/react';
import NextImage from 'next/image';

const imageConfigs = [
	{ className: 'top-[15%] left-[8%]', pointerFactor: 22 },
	{ className: 'top-[15%] right-[8%]', pointerFactor: -20 },
	{ className: 'bottom-[18%] left-[12%]', pointerFactor: -25 },
	{ className: 'bottom-[8%] right-[12%]', pointerFactor: 15 },
] as const;

const FLOATING_IMAGE_MAX_WIDTH = 175;

type Props = {
	image: { filename: string; alt: string | null; focus?: string | null; width?: number | null; height?: number | null };
	index: number;
	smoothMouseX: MotionValue<number>;
	smoothMouseY: MotionValue<number>;
};

export const FloatingImage = ({ image, index, smoothMouseX, smoothMouseY }: Props) => {
	const config = imageConfigs[index];
	const pointerFactor = config?.pointerFactor ?? 0;

	const x = useTransform(smoothMouseX, (value) => value * pointerFactor);
	const y = useTransform(smoothMouseY, (value) => value * pointerFactor);

	if (!config) {
		return null;
	}

	const dimensions = getScaledAssetDimensions(image, FLOATING_IMAGE_MAX_WIDTH);
	const imageSrc = formatStoryblokResizeUrl(image.filename, dimensions.width, dimensions.height);

	return (
		<motion.div className={cn('absolute hidden md:block', config.className)} style={{ x, y }}>
			<NextImage
				src={imageSrc}
				alt={image.alt ?? ''}
				width={dimensions.width}
				height={dimensions.height}
				sizes={`${FLOATING_IMAGE_MAX_WIDTH}px`}
				className="rounded-3xl"
			/>
		</motion.div>
	);
};
