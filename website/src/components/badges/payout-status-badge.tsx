'use client';

import { Badge } from '@/components/badge';
import { PayoutStatus } from '@/generated/prisma/enums';
import { AlertTriangleIcon, CheckIcon, CircleDollarSignIcon, CircleOffIcon, XCircleIcon } from 'lucide-react';
import { ComponentType } from 'react';

type PayoutStatusBadgeProps = {
	status: PayoutStatus | null;
};

const PAYOUT_STATUS_UI: Record<
	PayoutStatus,
	{
		variant: 'default' | 'verified' | 'destructive' | 'secondary' | 'outline' | 'outline-solid';
		label: string;
		Icon: ComponentType<{ className?: string }>;
	}
> = {
	paid: { variant: 'outline', label: 'Paid', Icon: CircleDollarSignIcon },
	confirmed: { variant: 'verified', label: 'Confirmed', Icon: CheckIcon },
	contested: { variant: 'outline', label: 'Contested', Icon: AlertTriangleIcon },
	failed: { variant: 'destructive', label: 'Failed', Icon: XCircleIcon },
};

export const PayoutStatusBadge = ({ status }: PayoutStatusBadgeProps) => {
	if (!status) {
		return (
			<Badge variant="secondary">
				<CircleOffIcon className="mr-1 h-4 w-4" />
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
};
