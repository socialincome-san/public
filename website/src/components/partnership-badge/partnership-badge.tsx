import type { Partnership } from '@/generated/storyblok/types/109655/storyblok-components';
import Link from 'next/link';

type Props = {
	partnership: Partnership;
};

export const PartnershipBadge = ({ partnership }: Props) => {
	const href = partnership.website.url || partnership.website.cached_url || '#';

	return (
		<Link
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="bg-muted inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium shadow-sm"
		>
			{partnership.logoIcon?.filename && (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={partnership.logoIcon.filename} alt="" aria-hidden="true" className="size-7 object-contain" />
			)}
			{partnership.name}
		</Link>
	);
};
