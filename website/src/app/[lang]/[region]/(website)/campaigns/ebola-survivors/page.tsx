import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CampaignCard } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-card';
import { CampaignFaq } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-faq';
import { CampaignTitle } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-title';
import { DonationForm } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/donation-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar flex flex-col space-y-12 py-16 md:py-32">
			<CampaignCard />
			<CampaignTitle />
			<DonationForm />
			<CampaignFaq />
		</BaseContainer>
	);
}
