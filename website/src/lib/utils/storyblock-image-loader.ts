export default function storyblokImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return `${src}?w=${width}${quality ? `&q=${quality}` : ''}`;
  }

  if (!url.hostname.endsWith('.storyblok.com')) {
    return `${src}?w=${width}${quality ? `&q=${quality}` : ''}`;
  }

  const crop = url.searchParams.get('_crop');
  const ratio = Number(url.searchParams.get('_ratio') || '0');
  url.searchParams.delete('_crop');
  url.searchParams.delete('_ratio');
  const baseUrl = url.toString();

  const height = ratio > 0 ? Math.round(width * ratio) : 0;
  const dimensions = `${width}x${height}`;
  const qualityParam = quality ? `:quality(${quality})` : '';

  if (crop && crop !== 'smart') {
    return `${baseUrl}/m/${dimensions}/filters:focal(${crop}):format(webp)${qualityParam}`;
  }
  if (crop === 'smart') {
    return `${baseUrl}/m/${dimensions}/smart/filters:format(webp)${qualityParam}`;
  }

  return `${baseUrl}/m/${dimensions}/filters:format(webp)${qualityParam}`;
}
