import { getScaledDimensions } from '@/lib/services/storyblok/storyblok.utils';
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
	image: { filename: string; alt: string | null };
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

	const dimensions = getScaledDimensions(image.filename, FLOATING_IMAGE_MAX_WIDTH) ?? {
		width: FLOATING_IMAGE_MAX_WIDTH,
		height: FLOATING_IMAGE_MAX_WIDTH,
	};

	return (
		<motion.div className={cn('absolute hidden md:block', config.className)} style={{ x, y }}>
			<NextImage
				src={image.filename}
				alt={image.alt ?? ''}
				width={dimensions.width}
				height={dimensions.height}
				className="rounded-3xl"
			/>
		</motion.div>
	);
};
