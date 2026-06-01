import { MakeDonationForm } from '@/components/make-donation-form';
import { HeroHeader } from '@/components/storyblok/shared/hero-header';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Stat = {
	value: number;
	label: string;
};

type Props = {
	lang: WebsiteLanguage;
	title: string;
	heroImageFilename?: string | null;
	heroImageAlt?: string | null;
	stats: Stat[];
	titleIcon?: string;
	titleIconAlt?: string;
};

export const HeroDonationsHeader = ({
	lang,
	title,
	heroImageFilename,
	heroImageAlt,
	stats,
	titleIcon,
	titleIconAlt,
}: Props) => {
	return (
		<HeroHeader
			title={title}
			heroImageFilename={heroImageFilename}
			heroImageAlt={heroImageAlt}
			stats={stats}
			titleIcon={titleIcon}
			titleIconAlt={titleIconAlt}
			rightSide={<MakeDonationForm lang={lang} />}
			bottomContent={<MakeDonationForm lang={lang} />}
		/>
	);
};
