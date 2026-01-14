'use client';

import { Badge } from '@/components/badge';
import { CountryCondition } from '@/lib/services/country/country.types';
import { AlertTriangleIcon, CheckIcon, XCircleIcon } from 'lucide-react';
import { ComponentType } from 'react';

const CONDITION_UI: Record<
	CountryCondition,
	{
		variant: 'verified' | 'destructive' | 'secondary';
		label: string;
		Icon: ComponentType<any>;
	}
> = {
	[CountryCondition.MET]: {
		variant: 'verified',
		label: 'Condition met',
		Icon: CheckIcon,
	},
	[CountryCondition.NOT_MET]: {
		variant: 'destructive',
		label: 'Conditions not met',
		Icon: XCircleIcon,
	},
	[CountryCondition.RESTRICTIONS_APPLY]: {
		variant: 'secondary',
		label: 'Restrictions apply',
		Icon: AlertTriangleIcon,
	},
};

type Props = {
	condition: CountryCondition;
};

export function CountryConditionBadge({ condition }: Props) {
	const { variant, label, Icon } = CONDITION_UI[condition];

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{label}
		</Badge>
	);
}
