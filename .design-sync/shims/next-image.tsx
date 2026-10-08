// Claude Design has no Next.js image optimizer: next/image renders a plain img.
import { type CSSProperties, forwardRef, type ImgHTMLAttributes } from 'react';

type StaticImageData = { src: string; width?: number; height?: number };

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
	src: string | StaticImageData;
	fill?: boolean;
	priority?: boolean;
	quality?: number | string;
	placeholder?: string;
	blurDataURL?: string;
	unoptimized?: boolean;
	loader?: unknown;
	overrideSrc?: string;
};

const fillStyle: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

const Image = forwardRef<HTMLImageElement, ImageProps>(
	(
		{ src, fill, priority, quality: _q, placeholder: _p, blurDataURL: _b, unoptimized: _u, loader: _l, overrideSrc, style, loading, ...props },
		ref,
	) => (
		<img
			ref={ref}
			src={overrideSrc ?? (typeof src === 'string' ? src : src.src)}
			loading={priority ? 'eager' : (loading ?? 'lazy')}
			style={fill ? { ...fillStyle, ...style } : style}
			{...props}
		/>
	),
);
Image.displayName = 'Image';

export type { ImageProps, StaticImageData };
export default Image;
