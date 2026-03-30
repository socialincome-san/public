import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerId, getLocalPartnerSlug, getLocalPartnerTitle } from './local-partner.utils';

type Props = {
	localPartners: LocalPartnerStory[];
	statsById: Record<string, { assignedRecipientsCount: number; waitingRecipientsCount: number } | undefined>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const formatLabel = (value: number, singular: string, plural: string) => {
	return value === 1 ? singular : plural;
};

export const LocalPartnersOverview = ({ localPartners, statsById, lang, region }: Props) => {
	return (
		<div className="w-site-width max-w-content mx-auto flex w-full flex-col gap-6 px-6 py-8">
			<h1 className="text-3xl font-semibold">Local partners</h1>
			{localPartners.length === 0 ? (
				<p className="text-muted-foreground">No local partners available yet.</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{localPartners.map((localPartner) => {
						const localPartnerId = getLocalPartnerId(localPartner.content);
						const localPartnerTitle = getLocalPartnerTitle(localPartner.content);
						const localPartnerSlug = getLocalPartnerSlug(localPartner);
						const stats = localPartnerId ? statsById[localPartnerId] : undefined;
						const heroImageFilename = localPartner.content.heroImage?.filename;
						const heroImageAlt = localPartner.content.heroImage?.alt ?? localPartnerTitle;

						return (
							<LandingPageCard
								key={localPartner.uuid}
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/local-partners/${localPartnerSlug}`}
								title={localPartnerTitle}
								heroImageFilename={heroImageFilename}
								heroImageAlt={heroImageAlt}
								stats={
									stats
										? [
												{
													value: stats.assignedRecipientsCount,
													label: formatLabel(
														stats.assignedRecipientsCount,
														'recipient in a program',
														'recipients in a program',
													),
												},
												{
													value: stats.waitingRecipientsCount,
													label: formatLabel(stats.waitingRecipientsCount, 'recipient waiting', 'recipients waiting'),
												},
											]
										: []
								}
							/>
						);
					})}
				</ul>
			)}
		</div>
	);
};
