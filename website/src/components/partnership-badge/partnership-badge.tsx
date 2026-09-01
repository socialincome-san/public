import type { Partnership } from '@/generated/storyblok/types/109655/storyblok-components';
import Image from 'next/image';
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
			className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-100 py-0 pr-4 pl-3 shadow-sm"
		>
			{partnership.logoIcon?.filename && (
				<span className="relative size-10 shrink-0">
					<Image
						src={partnership.logoIcon.filename}
						alt={partnership.logoIcon.alt || `${partnership.name} logo`}
						fill
						sizes="40px"
						className="object-contain"
					/>
				</span>
			)}
			<span className="text-foreground text-sm leading-5 font-medium whitespace-nowrap">{partnership.name}</span>
		</Link>
	);
};
