import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CampaignCard } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-card';
import { CampaignFaq } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-faq';
import { CampaignTitle } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-title';
import { DonationForm } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/donation-form';
import { BaseContainer } from '@socialincome/ui';

export default async function Page({ params: { lang } }: DefaultPageProps) {

	return (
		<BaseContainer className="min-h-screen-navbar flex flex-col space-y-12 py-16 md:py-32">
			<CampaignCard lang={lang} />
			<CampaignTitle lang={lang} />
			<DonationForm lang={lang} />
			<CampaignFaq lang={lang} />
		</BaseContainer>
	);
}
