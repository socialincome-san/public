'use client';

import { OUTFLOW_REACH_PERCENT } from '@/components/outflows/outflows-spend';
import { CheckList } from '@socialincome/design-system/data-display/check-list/check-list';
import { useLocale, useTranslations } from 'next-intl';
import { getSupportersImpactLabel } from '../../utils/community-stats';
import type { DonationWizardContext } from '../../wizard/donation-wizard-context';

type Props = {
	context: DonationWizardContext;
	cancelable: boolean;
};

export const PlanBenefits = ({ context, cancelable }: Props) => {
	const t = useTranslations('donation-wizard');
	const language = useLocale();
	const supporters = getSupportersImpactLabel(t, language, context.communityStats);

	return (
		<CheckList
			items={[
				...(cancelable ? [t('impact.cancel-anytime')] : []),
				t('calculator.reach', { percent: OUTFLOW_REACH_PERCENT }),
				...(supporters ? [supporters] : []),
			]}
		/>
	);
};
