'use client';

import { Button } from '@/components/button/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
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
			<CreateProgramStepIndicator className="order-1 w-full justify-center sm:order-2 sm:w-auto sm:flex-1" state={state} />

			<Button
				variant="outline"
				className="order-2 sm:order-1"
				onClick={() => send({ type: 'BACK' })}
				disabled={!state.can({ type: 'BACK' })}
			>
				{t('common.back')}
			</Button>

			<Button className="order-3" onClick={() => send({ type: 'NEXT' })} disabled={!state.can({ type: 'NEXT' })}>
				{t('common.continue')}
			</Button>
		</div>
	);
};
