import { Button } from '@/components/button/button';
import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import { SectionHeading } from '@/components/section-heading';
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
	cta?: Cta;
};

export const CampaignsGridSection = ({ heading, data, cta }: Props) => (
	<>
		{heading && <SectionHeading>{heading}</SectionHeading>}
		<CampaignsOverview campaigns={data.campaigns} statsById={data.statsById} />
		{cta && (
			<div className="mt-10 flex justify-center">
				<Button variant="outline" asChild>
					<NextLink href={cta.href}>{cta.label}</NextLink>
				</Button>
			</div>
		)}
	</>
);
