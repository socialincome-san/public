import { Typography } from './typography/typography';

export function ImageWithCaption({ image, caption }: { image: { filename: string; alt?: string }; caption: string }) {
	if (!image?.filename) return null;

	return (
		<div className="w-full px-0 py-8">
			<img src={image.filename} alt={image.alt || ''} className="m-0 h-auto w-full object-contain p-0" />
			{caption && (
				<Typography size="xs" className="m-0 mt-2 pt-4 text-left">
					{caption}
				</Typography>
			)}
		</div>
	);
}
