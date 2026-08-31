import { BlockWrapper } from '@/components/block-wrapper';
import { PartnershipBadge } from '@/components/partnership-badge/partnership-badge';
import type { Partnership, PartnershipsCard } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Markdown from 'react-markdown';

type Props = {
	blok: PartnershipsCard;
};

const isResolvedPartnership = (entry: ISbStoryData<Partnership> | string): entry is ISbStoryData<Partnership> =>
	typeof entry !== 'string';

export const PartnershipsCardBlock = ({ blok }: Props) => {
	const entries = (blok.partnerships ?? []).filter(isResolvedPartnership).map((entry) => entry.content);
	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="bg-background overflow-hidden rounded-3xl p-8 shadow-lg md:p-12">
				<p className="text-primary text-sm font-medium">Inflows</p>
				<h2 className="mt-4 text-3xl font-bold">{blok.title}</h2>
				{blok.description && (
					<div className="mt-4 max-w-3xl text-lg">
						<Markdown>{blok.description}</Markdown>
					</div>
				)}
				<div className="mt-8 flex flex-wrap gap-3">
					{entries.map((entry) => (
						<PartnershipBadge key={entry._uid} partnership={entry} />
					))}
				</div>
			</div>
		</BlockWrapper>
	);
};
