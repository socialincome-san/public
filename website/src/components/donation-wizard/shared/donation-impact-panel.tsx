'use client';

import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { ImpactPaymentLogos } from '@/components/payment-logos/impact-payment-logos';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import { cn } from '@/lib/utils/cn';
import { CircleCheckBig } from 'lucide-react';
import Image from 'next/image';
import { getSupportersImpactLabel } from '../utils/community-stats';
import { getDonationExplainerVideo } from '../utils/donation-explainer-video';
import {
	donationImpactChecklistItemClass,
	donationImpactExplainerClass,
	donationImpactRowClass,
} from '../utils/donation-wizard-layout';

const ZEWO_HOMEPAGE_URL = 'https://www.zewo.ch';

type Props = {
	communityStats: ContributorCommunityStats | null;
};

export const DonationImpactPanel = ({ communityStats }: Props) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const explainerVideo = getDonationExplainerVideo(language);
	const whyOnePercentLabel = t('impact.why-one-percent');

	const supportersLabel = getSupportersImpactLabel(t, language, communityStats);
	const checklist = [t('impact.tax-deductible'), t('impact.cancel-anytime'), ...(supportersLabel ? [supportersLabel] : [])];

	return (
		<div className="flex w-full flex-col gap-5 md:gap-6 md:px-6 md:pt-5">
			<h3 className="text-left text-lg leading-none font-medium md:text-xl">{t('impact.title')}</h3>
			<ul className="flex flex-col gap-4">
				{checklist.map((item) => (
					<li key={item} className={donationImpactChecklistItemClass}>
						<CircleCheckBig className="text-foreground size-[18px] shrink-0" aria-hidden />
						{item}
					</li>
				))}
			</ul>
			<div className="flex flex-col">
				<a
					href={ZEWO_HOMEPAGE_URL}
					target="_blank"
					rel="noopener noreferrer"
					className={cn('border-border hover:bg-muted/50 h-14 border-y px-2 transition-colors', donationImpactRowClass)}
				>
					<Image src="/assets/zewo.svg" alt="" width={38} height={37} className="size-[38px] shrink-0" aria-hidden />
					{t('impact.zewo')}
				</a>
				<ExplainerVideoTrigger
					layout="row"
					className={donationImpactExplainerClass}
					label={whyOnePercentLabel}
					embedUrl={explainerVideo.embedUrl}
					thumbnailSrc={explainerVideo.thumbnailSrc}
					thumbnailAlt={whyOnePercentLabel}
					dialogTitle={whyOnePercentLabel}
				/>
			</div>
			<div className="flex flex-wrap items-center justify-start gap-2">
				<span className="text-muted-foreground text-sm">{t('impact.pay-with')}</span>
				<ImpactPaymentLogos />
			</div>
		</div>
	);
};
