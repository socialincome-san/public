import type { ImageGeneratorGallery } from '@/generated/storyblok/types/109655/image-generator-gallery';
import { resultFail, resultOk } from '@/lib/result';
import { getImageGeneratorGalleryAction } from '@/modules/image-generator-gallery/image-generator-gallery.actions';
import { storyblokEditable } from '@storyblok/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageGeneratorGalleryBlock } from './image-generator-gallery';

jest.mock('@/modules/image-generator-gallery/image-generator-gallery.actions', () => ({
	getImageGeneratorGalleryAction: jest.fn(),
}));

jest.mock('@storyblok/react', () => ({
	storyblokEditable: jest.fn(() => ({ 'data-blok-uid': '109655-gallery' })),
}));

jest.mock('next-intl/server', () => {
	const messages = jest.requireActual<typeof import('../../lib/i18n/locales/en/website-image-gallery.json')>(
		'../../lib/i18n/locales/en/website-image-gallery.json',
	);

	return {
		getTranslations: jest.fn(() =>
			Promise.resolve((key: keyof typeof messages, values?: { amount: string }) =>
				messages[key].replace('{amount}', values?.amount ?? ''),
			),
		),
	};
});

const blok: ImageGeneratorGallery = { component: 'imageGeneratorGallery', _uid: 'gallery' };
const blobHost = 'https://jjjjivv3brvymvql.public.blob.vercel-storage.com';

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

test('renders editable gallery images in their supplied order with user prompts as alt text', async () => {
	jest.replaceProperty(process, 'env', {
		...process.env,
		IMAGE_GENERATOR_URL: 'https://internal-generator.example.com',
		IMAGE_GENERATOR_PASSWORD: 'server-only-generator-secret',
	});
	jest.mocked(getImageGeneratorGalleryAction).mockResolvedValueOnce(
		resultOk([
			{
				id: '2',
				prompt: 'A bicycle',
				previewUrl: `${blobHost}/previews/bicycle.webp`,
				imageUrl: `${blobHost}/images/bicycle.png`,
				costUsd: 0.06,
				createdAt: '2026-11-02T12:00:00Z',
			},
			{
				id: '1',
				prompt: null,
				previewUrl: `${blobHost}/previews/scene.webp`,
				imageUrl: null,
				costUsd: null,
				createdAt: null,
			},
		]),
	);

	const element = await ImageGeneratorGalleryBlock({ blok, lang: 'en' });
	const markup = renderToStaticMarkup(element);

	expect(markup).toContain('data-blok-uid="109655-gallery"');
	expect(markup).toContain('alt="A bicycle"');
	expect(markup).toContain('alt=""');
	expect(markup).toContain('loading="lazy"');
	expect(markup).toContain(`${blobHost}/previews/bicycle.webp`);
	expect(markup).toContain(`${blobHost}/previews/scene.webp`);
	expect(markup.indexOf('/previews/bicycle.webp')).toBeLessThan(markup.indexOf('/previews/scene.webp'));
	expect(markup).not.toContain('/_next/image');
	expect(markup).toContain('0.06 USD');
	expect(markup).toContain('dateTime="2026-11-02T12:00:00Z"');
	expect(markup).toContain('13:00');
	expect(markup).toContain('Cost unknown');
	expect(markup).toContain('aria-label="Show image prompt"');
	expect(markup).not.toContain('Delete image');
	expect(markup).toContain('Download');
	expect(markup).toContain(`href="${blobHost}/images/bicycle.png?download=1"`);
	expect(markup.match(/<a\b[^>]*\bdownload=""/g)).toHaveLength(1);
	expect(markup).not.toContain('/api/image-generator-gallery/');
	expect(markup).not.toContain('Transparent background');
	expect(markup).not.toContain(`href="${blobHost}/previews/scene.webp?download=1"`);
	expect(markup).not.toContain('Edit image');
	expect(markup).not.toContain('internal-generator.example.com');
	expect(markup).not.toContain('server-only-generator-secret');
	expect(markup).not.toContain('type="password"');
	expect(storyblokEditable).toHaveBeenCalledWith(blok);
	expect(getImageGeneratorGalleryAction).toHaveBeenCalledTimes(1);
});

test('renders nothing when there are no images', async () => {
	jest.mocked(getImageGeneratorGalleryAction).mockResolvedValueOnce(resultOk([]));
	await expect(ImageGeneratorGalleryBlock({ blok, lang: 'en' })).resolves.toBeNull();
	expect(storyblokEditable).not.toHaveBeenCalled();
});

test('initially renders 24 images and offers a load-more button for the rest', async () => {
	jest.mocked(getImageGeneratorGalleryAction).mockResolvedValueOnce(
		resultOk(
			Array.from({ length: 25 }, (_, index) => ({
				id: String(index),
				prompt: null,
				previewUrl: `${blobHost}/previews/image-${index}.webp`,
				imageUrl: null,
				costUsd: 0.06,
				createdAt: null,
			})),
		),
	);
	const markup = renderToStaticMarkup(await ImageGeneratorGalleryBlock({ blok, lang: 'en' }));
	expect(markup.match(/<article\b/g)).toHaveLength(24);
	expect(markup).toContain('Load more');
	expect(markup).not.toContain('/previews/image-24.webp');
});

test('renders nothing when the image generator is unavailable', async () => {
	jest.mocked(getImageGeneratorGalleryAction).mockResolvedValueOnce(resultFail('Unavailable.'));
	await expect(ImageGeneratorGalleryBlock({ blok, lang: 'en' })).resolves.toBeNull();
	expect(storyblokEditable).not.toHaveBeenCalled();
});
