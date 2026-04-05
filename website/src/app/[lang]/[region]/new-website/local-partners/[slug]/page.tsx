import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import { getLocalPartnerId } from '@/components/storyblok/local-partner/local-partner.utils';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function LocalPartnerPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const localPartnerResult = await services.storyblok.getLocalPartnerBySlug(slug, lang);

	if (!localPartnerResult.success) {
		return notFound();
	}

	const localPartnerId = getLocalPartnerId(localPartnerResult.data.content);
	const statsResult = localPartnerId
		? await services.read.localPartner.getPublicLocalPartnerStatsById(localPartnerId)
		: undefined;

	return (
		<LocalPartnerDetail
			localPartner={localPartnerResult.data}
			lang={lang as WebsiteLanguage}
			assignedRecipientsCount={statsResult?.success ? statsResult.data.assignedRecipientsCount : undefined}
			waitingRecipientsCount={statsResult?.success ? statsResult.data.waitingRecipientsCount : undefined}
		/>
	);
}
