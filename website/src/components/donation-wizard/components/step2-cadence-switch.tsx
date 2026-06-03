'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { ArrowLeftRight } from 'lucide-react';
import type { Cadence } from '../wizard/donation-amount';
import type { DonationWizardSend } from '../wizard/types';

type Props = {
	currentCadence: Cadence;
	send: DonationWizardSend;
};

export const Step2CadenceSwitch = ({ currentCadence, send }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const targetCadence: Cadence = currentCadence === 'monthly' ? 'one-time' : 'monthly';
	const labelKey = currentCadence === 'monthly' ? 'step2.switch-to-one-time' : 'step2.switch-to-monthly';

	return (
		<button
			type="button"
			onClick={() => send({ type: 'SET_CADENCE', value: targetCadence })}
			className="text-muted-foreground flex w-fit max-w-full items-center gap-1 self-start border-b border-slate-400 pb-0.5 text-left text-xs sm:self-auto sm:text-sm"
		>
			<ArrowLeftRight className="size-3.5" aria-hidden />
			{t(labelKey)}
		</button>
	);
};
