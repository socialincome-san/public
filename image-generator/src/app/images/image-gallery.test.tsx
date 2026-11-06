import { type GalleryImage } from '@/lib/images';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageGallery } from './image-gallery';

jest.mock('../image-edit-dialog', () => ({ ImageEditDialog: () => <button type="button">Edit image</button> }));
jest.mock('../download-menu', () => ({ DownloadMenu: () => <button type="button">Download image</button> }));
jest.mock('./delete-image-dialog', () => ({ DeleteImageDialog: () => <button type="button">Delete image</button> }));

const image: GalleryImage = {
	id: '1',
	prompt: 'A bicycle',
	previewUrl: 'https://test.public.blob.vercel-storage.com/previews/bicycle.webp',
	imageUrl: 'https://test.public.blob.vercel-storage.com/images/bicycle.png',
	media_type: 'image/png',
	created_at: '2026-11-02T12:00:00Z',
	cost_usd: 0.06,
};

test.each([0.06, null])('preserves the original generator gallery for cost %s', (cost) => {
	const markup = renderToStaticMarkup(<ImageGallery images={[{ ...image, cost_usd: cost }]} onImageAdded={jest.fn()} />);
	expect(markup).not.toContain('0.06 USD');
	expect(markup).not.toContain('Cost unknown');
	expect(markup).toContain('<time');
	expect(markup).toContain('13:00');
	expect(markup).toContain('Show image prompt');
	expect(markup).toContain('Edit image');
	expect(markup).toContain('Download image');
	expect(markup).toContain('Delete image');
});
