import { DefaultPageProps } from '@/app/[lang]/[region]';
import { AboutSI } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/about-si';
import { CampaignCard } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-card';
import { CampaignFaq } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-faq';
import { CampaignSiVideo } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-si-video';
import { CampaignTikTokVideos } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-tiktok-videos';
import { CampaignTitle } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/campaign-title';
import { DonationForm } from '@/app/[lang]/[region]/(website)/campaigns/ebola-survivors/donation-form';
import { BaseContainer } from '@socialincome/ui';

export default async function Page({ params: { lang } }: DefaultPageProps) {
	return (
		<BaseContainer className="min-h-screen-navbar flex flex-col space-y-12 py-16 md:py-32">
			<CampaignTitle lang={lang} />
			<CampaignTikTokVideos lang={lang} />
			<CampaignCard lang={lang} />
			<DonationForm lang={lang} />
			<AboutSI />
			<CampaignFaq lang={lang} />
			<CampaignSiVideo lang={lang} />
		</BaseContainer>
	);
}
