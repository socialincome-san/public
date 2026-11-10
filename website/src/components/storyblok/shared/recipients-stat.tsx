import type { HeroHeaderStat } from '@/components/storyblok/shared/hero-header';
import type { RecipientStatusBreakdown } from '@/modules/recipients/recipient.types';
import { ValueList, ValueListDivider, ValueListRow } from '@socialincome/design-system/data-display/value-list/value-list';
import { getTranslations } from 'next-intl/server';

const RecipientStatusTooltip = async ({ breakdown }: { breakdown: RecipientStatusBreakdown }) => {
	const t = await getTranslations('website-common');
	const statusRows = [
		{ label: t('recipient-status-breakdown.active'), value: breakdown.active },
		{ label: t('recipient-status-breakdown.former'), value: breakdown.former },
		{ label: t('recipient-status-breakdown.suspended'), value: breakdown.suspended },
		{ label: t('recipient-status-breakdown.deceased'), value: breakdown.deceased },
	].filter((row) => row.value > 0);
	const extraRows = [
		{ label: t('recipient-status-breakdown.new-last-30-days'), value: breakdown.newLast30Days },
		{ label: t('recipient-status-breakdown.waitlisted'), value: breakdown.waitlisted },
	].filter((row) => row.value > 0);

	return (
		<ValueList>
			{statusRows.map((row) => (
				<ValueListRow key={row.label} label={row.label} value={String(row.value)} />
			))}
			{statusRows.length > 0 && extraRows.length > 0 ? <ValueListDivider /> : null}
			{extraRows.map((row) => (
				<ValueListRow key={row.label} label={row.label} value={String(row.value)} />
			))}
		</ValueList>
	);
};

export const buildRecipientsStat = (breakdown: RecipientStatusBreakdown, label: string): HeroHeaderStat => ({
	value: breakdown.total,
	label,
	// Every recipient is in one of these, so zero means there is no row to show
	tooltip: breakdown.total + breakdown.waitlisted > 0 ? <RecipientStatusTooltip breakdown={breakdown} /> : undefined,
});
