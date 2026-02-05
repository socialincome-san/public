'use client';

import { Badge } from '@/components/badge';
import { PayoutStatus } from '@/generated/prisma/client';
import { AlertTriangleIcon, CheckIcon, ClockIcon, HelpCircleIcon, MinusIcon, XCircleIcon } from 'lucide-react';
import { ComponentType } from 'react';

type PayoutStatusBadgeProps = {
	status: PayoutStatus | null;
};

const PAYOUT_STATUS_UI: Record<
	PayoutStatus,
	{ variant: 'default' | 'verified' | 'destructive' | 'secondary' | 'outline'; label: string; Icon: ComponentType<any> }
> = {
	created: { variant: 'secondary', label: 'Created', Icon: ClockIcon },
	paid: { variant: 'verified', label: 'Paid', Icon: CheckIcon },
	confirmed: { variant: 'verified', label: 'Confirmed', Icon: CheckIcon },
	contested: { variant: 'outline', label: 'Contested', Icon: AlertTriangleIcon },
	failed: { variant: 'destructive', label: 'Failed', Icon: XCircleIcon },
	other: { variant: 'default', label: 'Other', Icon: HelpCircleIcon },
};

export function PayoutStatusBadge({ status }: PayoutStatusBadgeProps) {
	if (!status) {
		return (
			<Badge variant="outline">
				<MinusIcon className="mr-1 h-4 w-4" />
				No payout
			</Badge>
		);
	}

	const { variant, label, Icon } = PAYOUT_STATUS_UI[status];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}
