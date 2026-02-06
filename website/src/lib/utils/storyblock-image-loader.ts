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

	if (!url.hostname.endsWith('.storyblok.com')) {
		return src;
	}

	const crop = url.searchParams.get('_crop');
	const ratio = Number(url.searchParams.get('_ratio') || '0');
	url.searchParams.delete('_crop');
	url.searchParams.delete('_ratio');
	const baseUrl = url.toString();

	const h = ratio > 0 ? Math.round(width * ratio) : 0;
	const dims = `${width}x${h}`;
	const q = quality ? `:quality(${quality})` : '';

	if (crop && crop !== 'smart') {
		return `${baseUrl}/m/${dims}/filters:focal(${crop}):format(webp)${q}`;
	}
	if (crop === 'smart') {
		return `${baseUrl}/m/${dims}/smart/filters:format(webp)${q}`;
	}
	return `${baseUrl}/m/${width}x0/filters:format(webp)${q}`;
}
