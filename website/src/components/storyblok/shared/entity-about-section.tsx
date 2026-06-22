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
			<div className={cn('flex flex-col gap-4', showMap && 'lg:grid lg:grid-cols-2 lg:items-center lg:gap-12')}>
				{showMap && isoCode ? (
					<div className="flex justify-center">
						<MapBubble isoCode={isoCode} countryName={mapLabel} />
					</div>
				) : null}
				<div className="w-full max-w-md mx-auto flex flex-col gap-4 px-6 lg:px-0 lg:max-w-none m-auto">
					{preDescription}
					<h2 className="text-3xl font-semibold lg:text-4xl">{aboutHeading}</h2>
					<div className="w-full text-lg text-gray-900 text-justify break-words [&_p]:text-justify [&_p]:pl-0">
						<RichTextRenderer richTextDocument={description} />
					</div>
					{postDescription}
				</div>
			</div>
		</BlockWrapper>
	);
};
