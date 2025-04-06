import { Typography } from './typography/typography';

export function ImageWithCaption ({ image, caption, }: {
	image: { filename: string; alt?: string };
	caption: string;
}) {
	if (!image?.filename) return null;

	return (
		<div className="w-full py-8 px-0">
			<img
				src={image.filename}
				alt={image.alt || ''}
				className="w-full h-auto m-0 p-0 object-contain"
			/>
			{caption && (
				<Typography size="xs" className="mt-2 text-left pt-4 m-0">
					{caption}
				</Typography>
			)}
		</div>
	);
}