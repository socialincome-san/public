import { BlockWrapper } from '@/components/block-wrapper';
import { Marquee } from '@/components/marquee/marquee';
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
	const MIN_BADGES_PER_ROW = 20;

	const fillRow = (row: Partnership[]) => {
		if (row.length === 0) {
			return row;
		}

		const filled = [...row];

		while (filled.length < MIN_BADGES_PER_ROW) {
			filled.push(...row);
		}

		return filled;
	};

	const rows =
		entries.length === 1
			? [entries, entries]
			: [entries.filter((_, index) => index % 2 === 0), entries.filter((_, index) => index % 2 === 1)].filter(
					(row) => row.length > 0,
				);

	if ((blok.partnerships ?? []).length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="bg-background flex flex-col gap-6 overflow-hidden rounded-[32px] p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] sm:p-10">
				<p className="text-sm leading-5 font-medium text-cyan-900">Inflows</p>

				<h2 className="max-w-3xl text-2xl leading-snug font-normal md:text-3xl md:leading-tight">{blok.title}</h2>

				{blok.description && (
					<div className="max-w-3xl text-lg">
						<Markdown>{blok.description}</Markdown>
					</div>
				)}
				<div>
					{rows.map((row, rowIndex) => (
						<Marquee
							key={rowIndex === 0 ? 'first-row' : 'second-row'}
							direction={rowIndex === 0 ? 'left' : 'right'}
							speed="fast"
							className="-mx-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] px-4 py-1"
						>
							<div className="flex gap-6 pr-3 motion-reduce:w-full motion-reduce:flex-wrap">
								{fillRow(row).map((entry, index) => (
									<PartnershipBadge key={`${entry._uid}-${index}`} partnership={entry} />
								))}
							</div>
						</Marquee>
					))}
				</div>
			</div>
		</BlockWrapper>
	);
};
