'use client';

import type { TwilioTemplateDetail } from '@/modules/messaging/messaging.types';
import { Button } from '@socialincome/design-system/button/button';
import { Dialog, DialogContent } from '@socialincome/design-system/dialog/dialog';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { SendMessageWizard } from './send-message-wizard';

type SendMessageDialogProps = {
	template: TwilioTemplateDetail;
};

export const SendMessageDialog = ({ template }: SendMessageDialogProps) => {
	const [open, setOpen] = useState(false);
	const [locked, setLocked] = useState(false);

	const requestClose = () => {
		if (!locked) {
			setOpen(false);
		}
	};

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<Send />
				Send message
			</Button>

			<Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : requestClose())}>
				<DialogContent
					className="flex max-h-[90dvh] w-full flex-col overflow-hidden sm:h-[46rem] sm:!max-w-4xl"
					closeOnClickOutside={!locked}
					closeOnEscape={!locked}
					hideCloseButton={locked}
				>
					<SendMessageWizard template={template} onClose={() => setOpen(false)} onLockChange={setLocked} />
				</DialogContent>
			</Dialog>
		</>
	);
};
