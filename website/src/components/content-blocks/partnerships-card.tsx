import type { Partnership, PartnershipsCard } from '@/generated/storyblok/types/109655/storyblok-components';
import { Marquee } from '@socialincome/design-system/data-display/marquee/marquee';
import { PartnershipBadge } from '@socialincome/design-system/data-display/partnership-badge/partnership-badge';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable } from '@storyblok/react';
import Markdown from 'react-markdown';

type Props = {
	blok: PartnershipsCard;
};

const isResolvedPartnership = (entry: ISbStoryData<Partnership> | string): entry is ISbStoryData<Partnership> =>
	typeof entry !== 'string';

export const PartnershipsCardBlock = ({ blok }: Props) => {
	const entries = (blok.partnerships ?? []).filter(isResolvedPartnership).map((entry) => entry.content);

	// Repeats partners to avoid gaps while scrolling. Higher values make rows longer,
	// which increases the visible scroll speed because the duration stays the same.
	const MIN_BADGES_PER_ROW = 15;

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
		<BlockWrapper {...storyblokEditable(blok)}>
			<div className="bg-background shadow-card flex flex-col gap-6 overflow-hidden rounded-4xl p-6 sm:p-10">
				<p className="text-foreground text-sm leading-5 font-medium">Inflows</p>

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
							speed="regular"
						>
							<div className="flex gap-6 pr-3 motion-reduce:w-full motion-reduce:flex-wrap">
								{fillRow(row).map((entry, index) => {
									const href = entry.website.url || entry.website.cached_url || '#';
									const logoFilename = entry.logoIcon?.filename;

									return (
										<PartnershipBadge
											key={`${entry._uid}-${index}`}
											name={entry.name}
											href={href}
											logoSrc={logoFilename ?? undefined}
											logoAlt={entry.logoIcon?.alt ?? undefined}
										/>
									);
								})}
							</div>
						</Marquee>
					))}
				</div>
			</div>
		</BlockWrapper>
	);
};
