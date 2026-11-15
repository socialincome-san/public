import type { Result } from '@/lib/result';
import type { RecipientStatusBreakdown } from '@/modules/recipients/recipient.types';
import type { MediaHeroPillProps } from '@socialincome/design-system/layout/media-hero/media-hero';

type RecipientStatusLabel = 'active' | 'former' | 'suspended' | 'new' | 'waitlisted';

export const buildRecipientStatusBreakdown = (
	breakdownResult: Result<RecipientStatusBreakdown>,
	t: (key: `recipient-status.${RecipientStatusLabel}`) => string,
): { recipientsCount?: number; breakdown?: MediaHeroPillProps['breakdown'] } => {
	if (!breakdownResult.success) {
		return {};
	}
	const { activeCount, formerCount, suspendedCount, newCount, waitlistedCount, totalCount } = breakdownResult.data;
	const visibleRows = (rows: { label: string; value: number }[]) => rows.filter(({ value }) => value > 0);

	return {
		recipientsCount: totalCount,
		breakdown: {
			rows: visibleRows([
				{ label: t('recipient-status.active'), value: activeCount },
				{ label: t('recipient-status.former'), value: formerCount },
				{ label: t('recipient-status.suspended'), value: suspendedCount },
			]),
			extraRows: visibleRows([
				{ label: t('recipient-status.new'), value: newCount },
				{ label: t('recipient-status.waitlisted'), value: waitlistedCount },
			]),
		},
	};
};
