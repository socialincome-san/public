import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { PublicCampaignsWithStats } from '@/modules/campaigns/campaign.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

type Cta = {
	href: string;
	label: string;
};

type Props = {
	heading?: ReactNode;
	data: PublicCampaignsWithStats;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	cta?: Cta;
};

export const CampaignsGridSection = ({ heading, data, lang, currency, cta }: Props) => (
	<>
		{heading && (
			<div className="mb-8 md:mb-10">
				<SectionHeading>{heading}</SectionHeading>
			</div>
		)}
		<CampaignsOverview campaigns={data.campaigns} statsById={data.statsById} lang={lang} currency={currency} />
		{cta && (
			<div className="mt-10 flex justify-center">
				<Button variant="outline" asChild>
					<NextLink href={cta.href}>{cta.label}</NextLink>
				</Button>
			</div>
		)}
	</>
);
