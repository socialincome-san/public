import { BlockWrapper } from '@/components/block-wrapper';
import { MapBubble } from '@/components/storyblok/country/map-bubble';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { StoryblokRichtext } from '@/generated/storyblok/types/storyblok';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type Props = {
	isoCode?: string;
	mapLabel: string;
	aboutHeading: string;
	description: StoryblokRichtext;
	preDescription?: ReactNode;
	postDescription?: ReactNode;
};

export const EntityAboutSection = ({
	isoCode,
	mapLabel,
	aboutHeading,
	description,
	preDescription,
	postDescription,
}: Props) => {
	const showMap = Boolean(isoCode && isoCode !== '-');

	return (
		<BlockWrapper>
			<div className={cn('flex flex-col gap-8', showMap && 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-12')}>
				{showMap && isoCode ? (
					<div className="flex justify-center lg:justify-start">
						<MapBubble isoCode={isoCode} countryName={mapLabel} />
					</div>
				) : null}
				<div className="flex flex-col gap-4">
					{preDescription}
					<h2 className="text-4xl font-bold md:text-3xl">{aboutHeading}</h2>
					<div className="text-foreground prose max-w-none text-base">
						<RichTextRenderer richTextDocument={description} />
					</div>
					{postDescription}
				</div>
			</div>
		</BlockWrapper>
	);
};
