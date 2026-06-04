'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { Cadence } from '../../utils/donation-amount';
import { donationStepTitleRowClass } from '../../utils/donation-wizard-layout';
import type { DonationWizardSend } from '../../wizard/types';
import { CadenceSwitch } from './cadence-switch';

type Props = {
	titleKey: 'step2.monthly-title' | 'step2.one-time-title';
	cadence: Cadence;
	send: DonationWizardSend;
};

export const PlanStepHeader = ({ titleKey, cadence, send }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	return (
		<div className={donationStepTitleRowClass}>
			<h3 className="text-foreground min-w-0 text-base font-medium sm:text-lg">{t(titleKey)}</h3>
			<CadenceSwitch currentCadence={cadence} send={send} />
		</div>
	);
};
