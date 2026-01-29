export default function storyblokImageLoader({
	src,
	width,
	quality,
}: {
	src: string;
	width: number;
	quality?: number;
}) {
	let hostname: string;
	try {
		hostname = new URL(src).hostname;
	} catch {
		return src;
	}
	const isStoryblok = hostname === 'storyblok.com' || hostname.endsWith('.storyblok.com');
	if (!isStoryblok) {
		return src;
	}

	// Build Image Service URL: /m/WIDTHx0 preserves aspect ratio
	const qualityParam = quality ? `:quality(${quality})` : '';
	return `${src}/m/${width}x0/filters:format(webp)${qualityParam}`;
}
