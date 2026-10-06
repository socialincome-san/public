'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Button } from '@socialincome/design-system/button/button';
import { CreateProgramStepIndicator } from './create-program-step-indicator';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
};

export const CreateProgramWizardFooter = ({ state, send }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="mt-6 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t pt-4 sm:flex-nowrap sm:gap-4">
			<Button variant="outline" onClick={() => send({ type: 'BACK' })} disabled={!state.can({ type: 'BACK' })}>
				{t('common.back')}
			</Button>

			{/* On mobile the indicator takes its own first row above the buttons */}
			<div className="order-first w-full sm:order-none sm:w-auto sm:flex-1">
				<CreateProgramStepIndicator state={state} />
			</div>

			<Button onClick={() => send({ type: 'NEXT' })} disabled={!state.can({ type: 'NEXT' })}>
				{t('common.continue')}
			</Button>
		</div>
	);
};
