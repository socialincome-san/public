'use client';

import { Button } from '@/components/button';

type Props = {
	message: string;
	onRetry: () => void;
};

export function WizardError({ message, onRetry }: Props) {
	return (
		<div className="space-y-4 text-center">
			<p className="text-destructive font-medium">{message}</p>
			<Button onClick={onRetry}>Retry</Button>
		</div>
	);
}
