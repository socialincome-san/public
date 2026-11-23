'use client';

import { INDIRECT_BENEFICIARY_FACTOR } from '@/components/program/indirect-beneficiaries';
import { InfoTooltip } from '@socialincome/design-system/overlays/info-tooltip/info-tooltip';
import { useTranslations } from 'next-intl';
import type { getBeneficiaryImpact } from '../../utils/donation-amount';

export const PlanTileImpact = ({ directCount, indirectCount }: ReturnType<typeof getBeneficiaryImpact>) => {
	const t = useTranslations('donation-wizard');

	return t.rich('stepPlan.impact-short', {
		directCount,
		indirectCount,
		b: (chunks) => <strong>{chunks}</strong>,
	});
};

export const PlanTileImpactHint = () => {
	const t = useTranslations('donation-wizard');

	return (
		<InfoTooltip label={t('stepPlan.impact-tooltip-aria')} size="xs">
			{t('stepPlan.impact-tooltip', { factor: INDIRECT_BENEFICIARY_FACTOR })}
		</InfoTooltip>
	);
};
