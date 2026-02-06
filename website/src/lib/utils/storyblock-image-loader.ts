export default function storyblokImageLoader({
	src,
	width,
	quality,
}: {
	src: string;
	width: number;
	quality?: number;
}) {
	let url: URL;
	try {
		url = new URL(src);
	} catch {
		return src;
	}

	const isStoryblok = url.hostname === 'storyblok.com' || url.hostname.endsWith('.storyblok.com');
	if (!isStoryblok) {
		return src;
	}

	// Extract focal point or smart flag from query params (set by formatStoryblokUrl)
	const focal = url.searchParams.get('storyblok_focal');
	const smart = url.searchParams.get('storyblok_smart');

	// Remove custom params from URL
	url.searchParams.delete('storyblok_focal');
	url.searchParams.delete('storyblok_smart');
	const baseUrl = url.toString();

	// Build Image Service URL: /m/WIDTHx0 preserves aspect ratio
	const qualityParam = quality ? `:quality(${quality})` : '';

	if (focal) {
		return `${baseUrl}/m/${width}x0/filters:focal(${focal}):format(webp)${qualityParam}`;
	}
	if (smart) {
		return `${baseUrl}/m/${width}x0/smart/filters:format(webp)${qualityParam}`;
	}
	return `${baseUrl}/m/${width}x0/filters:format(webp)${qualityParam}`;
}
