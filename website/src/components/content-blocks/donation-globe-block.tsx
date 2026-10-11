import { GlobeStage } from '@/components/globe/globe-stage';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { DonationGlobe } from '@/generated/storyblok/types/109655/storyblok-components';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { getRecentSuccessfulContributionsAction } from '@/modules/contributions/contribution.actions';
import { getContributorCommunityStatsAction } from '@/modules/contributors/contributor.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: DonationGlobe;
	lang: WebsiteLanguage;
};

export const DonationGlobeBlock = async ({ blok, lang }: Props) => {
	const [communityStatsResult, contributionsResult, t] = await Promise.all([
		getContributorCommunityStatsAction(),
		getRecentSuccessfulContributionsAction(14),
		getTranslations('website-common'),
	]);

	const supporterCount = communityStatsResult.success ? communityStatsResult.data.supporterCount : null;
	const contributions = contributionsResult.success ? contributionsResult.data : [];

	const locale = getSafeNumberFormatLocale(lang);
	const globeLabel = t('transparency-page.donation-globe.aria-label');
	const description =
		supporterCount === null
			? null
			: t('transparency-page.donation-globe.description', {
					donatorsCount: formatNumberLocale(supporterCount, locale),
				});

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
				<div className="flex flex-col justify-center space-y-2 md:w-1/2">
					{blok.title && (
						<SectionHeading align="left">
							<StoryblokMarkdown>{blok.title}</StoryblokMarkdown>
						</SectionHeading>
					)}
					{description && <p className="text-foreground my-4 text-left text-xl">{description}</p>}
				</div>
				<div className="md:w-1/2">
					<GlobeStage contributions={contributions} locale={locale} label={globeLabel} />
				</div>
			</div>
		</BlockWrapper>
	);
};
