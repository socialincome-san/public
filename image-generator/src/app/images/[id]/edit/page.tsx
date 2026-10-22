import { GeneratorForm } from '@/app/generator-form';
import { getStoredImage } from '@/lib/database';
import { IMAGE_FORMATS } from '@/lib/image-formats';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import sharp from 'sharp';

const GalleryEditor = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	if (!/^[1-9][0-9]{0,18}$/.test(id) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
		notFound();
	const image = await getStoredImage(id);
	if (!image || !['image/png', 'image/jpeg', 'image/webp'].includes(image.media_type)) notFound();
	const input = sharp(Buffer.from(image.image_base64, 'base64'), { limitInputPixels: 4_000_000 });
	const { data, info } = await input.png().toBuffer({ resolveWithObject: true });
	if (!IMAGE_FORMATS.some((format) => format.width === info.width && format.height === info.height)) notFound();
	return (
		<GeneratorForm
			key={id}
			initialImage={{ src: `data:image/png;base64,${data.toString('base64')}`, width: info.width, height: info.height }}
		/>
	);
};

export default function EditImagePage({ params }: { params: Promise<{ id: string }> }) {
	return (
		<main className="flex flex-1 flex-col">
			<Suspense fallback={<AppLoadingSkeleton message="Loading image …" />}>
				<GalleryEditor params={params} />
			</Suspense>
		</main>
	);
}
