import { CampaignStatusBadge } from '@/app/portal/components/custom/badges/campaign-status-badge';
import { CellType } from '@/app/portal/components/custom/data-table/elements/types';

export function CampaignStatusCell<TData>({ ctx }: CellType<TData, boolean>) {
	console.log(ctx.getValue());
	const value = !!ctx.getValue();
	return <CampaignStatusBadge status={value} />;
}
