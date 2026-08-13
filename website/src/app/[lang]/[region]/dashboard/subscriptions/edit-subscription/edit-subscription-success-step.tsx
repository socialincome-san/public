'use client';

import { Button } from '@/components/button/button';
import { CircleCheck } from 'lucide-react';

type Props = {
	labels: {
		message: string;
		thanks: string;
		done: string;
		viewQr?: string;
	};
	onDone: () => void;
	onViewQr?: () => void;
};

export const EditSubscriptionSuccessStep = ({ labels, onDone, onViewQr }: Props) => {
	return (
		<div className="flex flex-col items-center gap-8 py-4" data-testid="edit-subscription-success-step">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="bg-confirm/15 flex size-16 items-center justify-center rounded-full">
					<CircleCheck className="text-confirm size-8" aria-hidden />
				</div>
				<div className="flex flex-col gap-2">
					<p className="text-xl leading-7 font-medium">{labels.message}</p>
					<p className="text-muted-foreground text-sm leading-5">{labels.thanks}</p>
				</div>
			</div>
			<div className="flex w-full gap-3">
				{onViewQr && labels.viewQr && (
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={onViewQr}
						data-testid="edit-subscription-view-qr"
					>
						{labels.viewQr}
					</Button>
				)}
				<Button type="button" className="flex-1" onClick={onDone} data-testid="edit-subscription-done">
					{labels.done}
				</Button>
			</div>
		</div>
	);
};
