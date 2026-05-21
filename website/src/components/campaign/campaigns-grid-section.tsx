import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import { SectionHeading } from '@/components/section-heading';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicCampaignsWithStats } from '@/lib/services/campaign/campaign.types';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
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
	blok?: SbBlokData;
};

export const CampaignsGridSection = ({ heading, data, lang, region, cta, blok }: Props) => (
	<BlockWrapper {...(blok ? storyblokEditable(blok) : {})}>
		{heading ? <SectionHeading>{heading}</SectionHeading> : null}
		<CampaignsOverview campaigns={data.campaigns} statsById={data.statsById} lang={lang} region={region} />
		{cta ? (
			<div className="mt-10 flex justify-center">
				<Button variant="outline" asChild>
					<NextLink href={cta.href}>{cta.label}</NextLink>
				</Button>
			</div>
		) : null}
	</BlockWrapper>
);
