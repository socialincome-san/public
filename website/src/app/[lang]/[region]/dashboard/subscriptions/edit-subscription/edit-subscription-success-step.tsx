'use client';

import { Button } from '@/components/button/button';
import { CircleCheck } from 'lucide-react';

type Props = {
	labels: {
		message: string;
		thanks: string;
		done: string;
	};
	onDone: () => void;
};

export const EditSubscriptionSuccessStep = ({ labels, onDone }: Props) => {
	return (
		<div className="flex flex-col items-center gap-8 py-4" data-testid="edit-subscription-success-step">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="bg-confirm/15 flex size-16 items-center justify-center rounded-full">
					<CircleCheck className="text-confirm size-8" aria-hidden />
				</div>
				<div className="flex flex-col gap-2">
					<p className="text-2xl font-medium">{labels.message}</p>
					<p className="text-muted-foreground text-base">{labels.thanks}</p>
				</div>
			</div>
			<Button type="button" className="w-full" onClick={onDone} data-testid="edit-subscription-done">
				{labels.done}
			</Button>
		</div>
	);
};
