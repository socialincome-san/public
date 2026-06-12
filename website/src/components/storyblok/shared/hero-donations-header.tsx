import { MakeDonationForm } from '@/components/make-donation-form';
import { HeroHeader, type HeroHeaderImage, type HeroHeaderStat } from '@/components/storyblok/shared/hero-header';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	lang: WebsiteLanguage;
	title: string;
	heroImage?: HeroHeaderImage | null;
	stats: HeroHeaderStat[];
	titleIcon?: string;
	titleIconAlt?: string;
	showDonationForm?: boolean;
};

export const HeroDonationsHeader = ({
	lang,
	title,
	heroImage,
	stats,
	titleIcon,
	titleIconAlt,
	showDonationForm = true,
}: Props) => {
	return (
		<HeroHeader
			title={title}
			heroImage={heroImage}
			stats={stats}
			titleIcon={titleIcon}
			titleIconAlt={titleIconAlt}
			rightSide={showDonationForm && <MakeDonationForm lang={lang} />}
			bottomContent={showDonationForm && <MakeDonationForm lang={lang} />}
		/>
	);
};
