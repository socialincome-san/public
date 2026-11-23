'use client';

import { ExplainerVideoTrigger } from '@/components/explainer-video/explainer-video-trigger';
import { OUTFLOW_REACH_PERCENT } from '@/components/outflows/outflows-spend';
import { ImpactPaymentLogos } from '@/components/payment-logos/impact-payment-logos';
import { useIsSwissVisitor } from '@/lib/geo/visitor-country';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { CheckList } from '@socialincome/design-system/data-display/check-list/check-list';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { Heart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { ZEWO_NPO_DETAIL_URL } from '../steps/step-amount/donation-amount-fields';
import { getSupportersImpactLabel } from '../utils/community-stats';
import { getDonationExplainerVideo } from '../utils/donation-explainer-video';
import type { DonationWizardContext } from '../wizard/donation-wizard-context';

type Props = {
	context: DonationWizardContext;
};

export const DonationInfoCard = ({ context }: Props) => {
	const t = useTranslations('donation-wizard');
	const language = useLocale();
	const isSwissVisitor = useIsSwissVisitor();
	const explainerVideo = getDonationExplainerVideo(language);
	const whyOnePercent = t('impact.why-one-percent');
	const supporters = getSupportersImpactLabel(t, language, context.communityStats);
	const cancelable = context.cadence === 'monthly' || context.oneTimePlanChoice === 'monthly-half';

	return (
		<Card
			padding="sm"
			elevation="flat"
			fullHeight
			footer={
				<span className="flex flex-wrap items-center gap-2">
					{t('impact.pay-with')}
					<ImpactPaymentLogos />
				</span>
			}
		>
			<div className="flex h-full flex-col justify-between gap-4">
				<CheckList
					size="lg"
					items={[
						...(cancelable ? [t('impact.cancel-anytime')] : []),
						t('calculator.reach', { percent: OUTFLOW_REACH_PERCENT }),
						...(supporters ? [{ label: supporters, icon: <Heart aria-hidden /> }] : []),
						...(isSwissVisitor
							? [{ label: t('impact.zewo'), imageSrc: '/assets/zewo.svg', href: ZEWO_NPO_DETAIL_URL }]
							: []),
					]}
				/>
				<Separator />
				<ExplainerVideoTrigger
					layout="compact"
					label={whyOnePercent}
					embedUrl={explainerVideo.embedUrl}
					thumbnailSrc={explainerVideo.thumbnailSrc}
					thumbnailAlt={whyOnePercent}
					dialogTitle={whyOnePercent}
				/>
			</div>
		</Card>
	);
};
