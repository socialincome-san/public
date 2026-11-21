'use client';

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
