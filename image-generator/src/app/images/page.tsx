import { getGalleryBatch } from '@/lib/database';
import { Alert, AlertDescription } from '@socialincome/design-system/feedback/alert/alert';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { GalleryLoadMore } from './gallery-load-more';

const GalleryContent = async () => {
	const batch = await getGalleryBatch();
	return <GalleryLoadMore {...batch} />;
};

export default function ImagesPage() {
	return (
		<main className="max-w-content mx-auto w-full px-6 py-6 pb-24 sm:px-8">
			<div className="mb-8 flex flex-col items-start gap-2">
				<SectionHeading as="h1" size={3} align="left" bold>
					Generated Images
				</SectionHeading>
			</div>
			<div className="mb-8">
				<Alert>
					<Info aria-hidden="true" />
					<AlertDescription>
						<p>
							Images displayed here are also{' '}
							<Link href="https://www.socialincome.org/visual-archive" className="underline">
								publicly visible
							</Link>
							. To remove an image from public view, delete it.
						</p>
					</AlertDescription>
				</Alert>
			</div>
			<Suspense fallback={<AppLoadingSkeleton />}>
				<GalleryContent />
			</Suspense>
		</main>
	);
}
