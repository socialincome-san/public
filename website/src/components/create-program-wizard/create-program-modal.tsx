'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { createProgramWizardMachine } from './wizard/create-program-machine';
import { CreateProgramWizard } from './wizard/create-program-wizard';

type Props = {
	trigger: ReactNode;
	isAuthenticated?: boolean;
};

export const CreateProgramModal = ({ trigger, isAuthenticated = false }: Props) => {
	const [state, send] = useMachine(createProgramWizardMachine, {
		input: { isAuthenticated },
	});
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	const router = useRouter();

	const isOpen = !state.matches('closed');
	const createdProgramId = state.context.createdProgramId;

	useEffect(() => {
		if (!createdProgramId || !isAuthenticated) {
			return;
		}

		router.replace(`/portal/programs/${createdProgramId}/overview`);
	}, [createdProgramId, isAuthenticated, router]);

	return (
		<>
			<div
				data-testid="create-program-modal-trigger"
				role="button"
				tabIndex={0}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				onClick={() => send({ type: 'OPEN' })}
			>
				{trigger}
			</div>

			<Dialog open={isOpen} onOpenChange={(open) => send({ type: open ? 'OPEN' : 'CLOSE' })}>
				<DialogContent variant="large" className="max-h-[90dvh] flex flex-col overflow-hidden">
					<DialogHeader>
						<DialogTitle>{t('modal.title')}</DialogTitle>
					</DialogHeader>

					<CreateProgramWizard state={state} send={send} onGoToLogin={() => router.replace('/login')} />
				</DialogContent>
			</Dialog>
		</>
	);
};
