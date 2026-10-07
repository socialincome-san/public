'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Button } from '@socialincome/design-system/actions/button/button';
import { WizardFooter } from '@socialincome/design-system/navigation/wizard-footer/wizard-footer';
import { CreateProgramStepIndicator } from './create-program-step-indicator';
import { CreateProgramWizardSend, CreateProgramWizardState } from './types';

type Props = {
	state: CreateProgramWizardState;
	send: CreateProgramWizardSend;
};

export const CreateProgramWizardFooter = ({ state, send }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="mt-6">
			<WizardFooter
				back={
					<Button variant="outline" onClick={() => send({ type: 'BACK' })} disabled={!state.can({ type: 'BACK' })}>
						{t('common.back')}
					</Button>
				}
				progress={<CreateProgramStepIndicator state={state} />}
				primary={
					<Button onClick={() => send({ type: 'NEXT' })} disabled={!state.can({ type: 'NEXT' })}>
						{t('common.continue')}
					</Button>
				}
			/>
		</div>
	);
};
