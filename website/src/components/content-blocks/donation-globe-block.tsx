import { BlockWrapper } from '@/components/block-wrapper';
import { GlobeStage } from '@/components/globe/globe-stage';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { DonationGlobe } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { unstable_cache } from 'next/cache';

const getCachedCommunityStats = unstable_cache(
	async () => {
		const result = await services.read.contributor.getCommunityStats();
		if (!result.success) {
			throw new Error(result.error);
		}

		return result.data;
	},
	['donation-globe-community-stats'],
	{ revalidate: 300 },
);

type Props = {
	blok: DonationGlobe;
	lang: WebsiteLanguage;
};

export const DonationGlobeBlock = async ({ blok, lang }: Props) => {
	const cutoff = new Date();
	cutoff.setUTCDate(cutoff.getUTCDate() - 14);

	const [communityStats, contributionsResult] = await Promise.all([
		getCachedCommunityStats().catch(() => null),
		services.read.contribution.getRecentSuccessfulContributions(cutoff),
	]);

	const supporterCount = communityStats?.supporterCount ?? null;
	const contributions = contributionsResult.success ? contributionsResult.data : [];

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const locale = getSafeNumberFormatLocale(lang);
	const globeLabel = translator.t('transparency-page.donation-globe.aria-label');
	const description =
		supporterCount === null
			? null
			: translator.t('transparency-page.donation-globe.description', {
					context: {
						donatorsCount: formatNumberLocale(supporterCount, locale),
					},
				});

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
				<div className="flex flex-col justify-center space-y-2 md:w-1/2">
					{blok.title && (
						<SectionHeading align="left" className="mb-0 whitespace-pre-line md:mb-0">
							<StoryblokMarkdown>{blok.title}</StoryblokMarkdown>
						</SectionHeading>
					)}
					{description && <p className="text-foreground my-4 text-left">{description}</p>}
				</div>
				<div className="md:w-1/2">
					<GlobeStage contributions={contributions} locale={locale} label={globeLabel} />
				</div>
			</div>
		</BlockWrapper>
	);
};
