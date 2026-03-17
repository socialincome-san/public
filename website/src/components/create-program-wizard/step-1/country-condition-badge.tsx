'use client';

import { Badge } from '@/components/badge';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { CountryCondition } from '@/lib/services/country/country.types';
import { AlertTriangleIcon, CheckIcon, XCircleIcon } from 'lucide-react';
import { ComponentType } from 'react';

const CONDITION_UI: Record<
	CountryCondition,
	{
		variant: 'verified' | 'destructive' | 'secondary';
		label: string;
		Icon: ComponentType<{ className?: string }>;
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
		label: 'Restrictions',
		Icon: AlertTriangleIcon,
	},
};

type Props = {
	condition: CountryCondition;
};

export const CountryConditionBadge = ({ condition }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });
	const { variant, label, Icon } = CONDITION_UI[condition];
	const translatedLabel =
		condition === CountryCondition.MET
			? t('step1.condition.met')
			: condition === CountryCondition.NOT_MET
				? t('step1.condition.not_met')
				: t('step1.condition.restrictions_apply');

	return (
		<Badge variant={variant}>
			<Icon className="mr-1 h-4 w-4" />
			{translatedLabel || label}
		</Badge>
	);
};
