'use client';

import { Badge } from '@/app/portal/components/ui/badge';
import { CircleSlashIcon, HourglassIcon } from 'lucide-react';
import { ComponentType } from 'react';

type CampaignStatusBadgeProps = {
	status: boolean;
};

const CAMPAIGN_STATUS_UI: Record<
	'active' | 'inactive',
	{ variant: 'verified' | 'destructive' | 'outline' | 'secondary' | 'default'; label: string; Icon: ComponentType<any> }
> = {
	active: { variant: 'verified', label: 'Active', Icon: HourglassIcon },
	inactive: { variant: 'default', label: 'Inactive', Icon: CircleSlashIcon },
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
	const key = status ? 'active' : 'inactive';
	const { variant, label, Icon } = CAMPAIGN_STATUS_UI[key];
	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}
