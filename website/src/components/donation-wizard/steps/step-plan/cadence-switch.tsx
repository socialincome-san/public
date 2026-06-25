'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { ArrowLeftRight } from 'lucide-react';
import type { Cadence } from '../../utils/donation-amount';
import { selectCadenceSwitchView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardSend } from '../../wizard/types';

type Props = {
	currentCadence: Cadence;
	send: DonationWizardSend;
};

export const CadenceSwitch = ({ currentCadence, send }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { targetCadence, labelKey } = selectCadenceSwitchView(currentCadence);

	return (
		<button
			type="button"
			onClick={() => send({ type: 'SET_CADENCE', value: targetCadence })}
			className="text-muted-foreground border-muted-foreground flex w-fit max-w-full items-center gap-1 self-start border-b pb-0.5 text-left text-xs sm:self-auto sm:text-sm"
		>
			<ArrowLeftRight className="size-3.5" aria-hidden />
			{t(labelKey)}
		</button>
	);
};
