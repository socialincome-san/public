'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { createProgramWizardMachine } from './wizard/create-program-machine';
import { CreateProgramWizard } from './wizard/create-program-wizard';

type RenderTriggerProps = {
	isOpen: boolean;
	open: () => void;
};

type Props = {
	trigger: ReactNode | ((props: RenderTriggerProps) => ReactNode);
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
	const open = () => send({ type: 'OPEN' });
	const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		open();
	};

	useEffect(() => {
		if (!createdProgramId || !isAuthenticated) {
			return;
		}

		router.replace(`/portal/programs/${createdProgramId}/overview`);
	}, [createdProgramId, isAuthenticated, router]);

	return (
		<>
			{typeof trigger === 'function' ? (
				trigger({ isOpen, open })
			) : (
				<div
					data-testid="create-program-modal-trigger"
					role="button"
					tabIndex={0}
					aria-haspopup="dialog"
					aria-expanded={isOpen}
					onClick={open}
					onKeyDown={handleTriggerKeyDown}
				>
					{trigger}
				</div>
			)}

			<Dialog open={isOpen} onOpenChange={(nextOpen) => send({ type: nextOpen ? 'OPEN' : 'CLOSE' })}>
				<DialogContent variant="large" className="flex max-h-[90dvh] flex-col overflow-hidden">
					<DialogHeader>
						<DialogTitle>{t('modal.title')}</DialogTitle>
					</DialogHeader>

					<CreateProgramWizard state={state} send={send} onGoToLogin={() => router.replace('/login')} />
				</DialogContent>
			</Dialog>
		</>
	);
};
