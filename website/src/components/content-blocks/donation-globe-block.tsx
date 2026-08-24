import { GlobeStage } from '@/components/globe/globe-stage';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { DonationGlobe } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: DonationGlobe;
	lang: WebsiteLanguage;
};

export const DonationGlobeBlock = async ({ blok, lang }: Props) => {
	const cutoff = new Date();
	cutoff.setUTCDate(cutoff.getUTCDate() - 14);

	const [communityStatsResult, contributionsResult] = await Promise.all([
		services.read.contributor.getCommunityStats(),
		services.read.contribution.getRecentSuccessfulContributions(cutoff),
	]);

	const donatorsCount = communityStatsResult.success ? communityStatsResult.data.supporterCount : 0;
	const contributions = contributionsResult.success ? contributionsResult.data : [];

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const description = translator.t('transparency-page.donation-globe.description', {
		context: {
			donatorsCount: formatNumberLocale(donatorsCount, getSafeNumberFormatLocale(lang)),
		},
	});

	return (
		<div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14" {...storyblokEditable(blok as SbBlokData)}>
			<div className="flex flex-col justify-center space-y-2 md:w-1/2">
				{blok.title && (
					<h1 className="text-primary text-4xl whitespace-pre-line md:text-5xl [&_strong]:font-bold">
						<StoryblokMarkdown>{blok.title}</StoryblokMarkdown>
					</h1>
				)}
				<p className="text-foreground my-4 text-left">{description}</p>
			</div>
			<div className="md:w-1/2">
				<GlobeStage contributions={contributions} />
			</div>
		</div>
	);
};
