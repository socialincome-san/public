import { Button } from '@/components/button';
import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import { SectionHeading } from '@/components/section-heading';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicCampaignsWithStats } from '@/lib/services/campaign/campaign.types';
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
	region: WebsiteRegion;
	cta?: Cta;
};

export const CampaignsGridSection = ({ heading, data, lang, region, cta }: Props) => (
	<>
		{heading && <SectionHeading>{heading}</SectionHeading>}
		<CampaignsOverview campaigns={data.campaigns} statsById={data.statsById} lang={lang} region={region} />
		{cta && (
			<div className="mt-10 flex justify-center">
				<Button variant="outline" asChild>
					<NextLink href={cta.href}>{cta.label}</NextLink>
				</Button>
			</div>
		)}
	</>
);
