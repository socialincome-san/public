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
		<div className="mt-6 grid shrink-0 grid-cols-2 items-center gap-3 border-t pt-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4">
			<CreateProgramStepIndicator
				className="col-span-2 row-start-1 justify-self-center sm:col-span-1 sm:col-start-2"
				state={state}
			/>

			<Button
				variant="outline"
				className="col-start-1 row-start-2 justify-self-start sm:row-start-1"
				onClick={() => send({ type: 'BACK' })}
				disabled={!state.can({ type: 'BACK' })}
			>
				{t('common.back')}
			</Button>

			<Button
				className="col-start-2 row-start-2 justify-self-end sm:col-start-3 sm:row-start-1"
				onClick={() => send({ type: 'NEXT' })}
				disabled={!state.can({ type: 'NEXT' })}
			>
				{t('common.continue')}
			</Button>
		</div>
	);
};
