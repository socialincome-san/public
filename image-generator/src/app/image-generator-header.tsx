'use client';

import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import { SegmentedToggle } from '@socialincome/design-system/actions/segmented-toggle/segmented-toggle';
import { SocialIncomeLogo } from '@socialincome/design-system/brand/logo/logo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const ImageGeneratorHeader = () => {
	const pathname = usePathname();
	const router = useRouter();
	const isGallery = pathname === '/images';

	return (
		<header className="w-full">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:py-8">
				<Link
					href="/"
					className="text-primary flex items-center transition-opacity hover:opacity-85"
					aria-label="Social Income"
				>
					<SocialIncomeLogo decorative />
				</Link>

				<SegmentedToggle
					value={isGallery ? 'gallery' : 'generator'}
					onValueChange={(val) => router.push(val === 'gallery' ? '/images' : '/')}
					options={[
						{ value: 'generator', label: 'Generator' },
						{ value: 'gallery', label: 'Gallery' },
					]}
				/>

				<div className="hidden sm:flex items-center">
					<LinkPill label="socialincome.org" href="https://socialincome.org" external />
				</div>
			</div>
		</header>
	);
};
