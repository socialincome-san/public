import {
	DEFAULT_OPEN_GRAPH_IMAGE_URL,
	DEFAULT_TWITTER_IMAGE_URL,
	toProductionMetadataImage,
	toProductionMetadataUrl,
} from './metadata';

describe('metadata utils', () => {
	describe('toProductionMetadataUrl', () => {
		const fallback = DEFAULT_OPEN_GRAPH_IMAGE_URL;

		it('uses the Open Graph fallback for Twitter fallback metadata', () => {
			expect(DEFAULT_TWITTER_IMAGE_URL).toBe(DEFAULT_OPEN_GRAPH_IMAGE_URL);
		});

		it('resolves relative metadata paths against the production origin', () => {
			expect(toProductionMetadataUrl('/assets/metadata/og/default.jpg', fallback)).toBe(
				'https://socialincome.org/assets/metadata/og/default.jpg',
			);
		});

		it('keeps valid https metadata URLs', () => {
			const url = 'https://a.storyblok.com/f/109655/1200x630/example.jpg/m/1200x630/smart';

			expect(toProductionMetadataUrl(url, fallback)).toBe(url);
		});

		it.each([
			'http://socialincome.org/assets/metadata/og/default.jpg',
			'https://localhost/assets/metadata/og/default.jpg',
			'https://preview.localhost/assets/metadata/og/default.jpg',
			'https://preview.localhost./assets/metadata/og/default.jpg',
			'https://127.0.0.1/assets/metadata/og/default.jpg',
			'https://10.0.0.1/assets/metadata/og/default.jpg',
			'https://172.16.0.1/assets/metadata/og/default.jpg',
			'https://172.31.255.255/assets/metadata/og/default.jpg',
			'https://192.168.0.1/assets/metadata/og/default.jpg',
			'https://169.254.1.1/assets/metadata/og/default.jpg',
			'https://0.0.0.0/assets/metadata/og/default.jpg',
			'https://[::]/assets/metadata/og/default.jpg',
			'https://[::1]/assets/metadata/og/default.jpg',
			'https://[::ffff:127.0.0.1]/assets/metadata/og/default.jpg',
			'https://[fc00::1]/assets/metadata/og/default.jpg',
			'https://[fd00::1]/assets/metadata/og/default.jpg',
			'https://[fe80::1]/assets/metadata/og/default.jpg',
			'https://socialincome-git-demo.vercel.app/assets/metadata/og/default.jpg',
			'https://socialincome-git-demo.vercel.app./assets/metadata/og/default.jpg',
		])('falls back for blocked metadata URL %s', (url) => {
			expect(toProductionMetadataUrl(url, fallback)).toBe(fallback);
		});
	});

	describe('toProductionMetadataImage', () => {
		const fallback = DEFAULT_OPEN_GRAPH_IMAGE_URL;

		it('falls back when no image metadata exists', () => {
			expect(toProductionMetadataImage(undefined, fallback)).toBe(fallback);
		});

		it('falls back when image metadata has a blocked URL', () => {
			expect(
				toProductionMetadataImage(
					{
						url: 'https://localhost/assets/metadata/og/default.jpg',
						width: 1200,
						height: 630,
						alt: 'Social Income',
					},
					fallback,
				),
			).toBe(fallback);
		});

		it('normalizes image metadata URLs and preserves image fields', () => {
			expect(
				toProductionMetadataImage(
					{
						url: '/assets/metadata/og/custom.jpg',
						width: 1200,
						height: 630,
						alt: 'Social Income',
					},
					fallback,
				),
			).toEqual({
				url: 'https://socialincome.org/assets/metadata/og/custom.jpg',
				width: 1200,
				height: 630,
				alt: 'Social Income',
			});
		});
	});
});
