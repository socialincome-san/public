export default function storyblokImageLoader({
	src,
	width,
	quality,
}: {
	src: string;
	width: number;
	quality?: number;
}) {
	// Only transform Storyblok URLs
	if (!src.includes('storyblok.com')) {
		return src;
	}

	// Build Image Service URL: /m/WIDTHx0 preserves aspect ratio
	const qualityParam = quality ? `:quality(${quality})` : '';
	return `${src}/m/${width}x0/filters:format(webp)${qualityParam}`;
}
