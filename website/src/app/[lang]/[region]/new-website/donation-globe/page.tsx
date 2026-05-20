import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { DonationGlobeSection } from '@/components/donation-globe/DonationGlobeSection';
import { getDonationFlows } from '@/lib/donations/get-donation-flows';
import { WebsiteLanguage } from '@/lib/i18n/utils';

export const revalidate = 900;

export default async function DonationGlobePage({ params }: DefaultLayoutProps) {
	const { lang } = await params;
	const { flows, stats } = await getDonationFlows(lang as WebsiteLanguage);

	return <DonationGlobeSection flows={flows} stats={stats} lang={lang as WebsiteLanguage} />;
}
