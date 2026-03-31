import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import { Translator } from '@/lib/i18n/translator';
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

export const LocalPartnersOverview = async ({ localPartners, statsById, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-6">
			{localPartners.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('local-partners-page.empty')}</p>
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
													label:
														stats.assignedRecipientsCount === 1
															? translator.t('local-partners-page.recipient-in-program-singular')
															: translator.t('local-partners-page.recipient-in-program-plural'),
												},
												{
													value: stats.waitingRecipientsCount,
													label:
														stats.waitingRecipientsCount === 1
															? translator.t('local-partners-page.recipient-waiting-singular')
															: translator.t('local-partners-page.recipient-waiting-plural'),
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
