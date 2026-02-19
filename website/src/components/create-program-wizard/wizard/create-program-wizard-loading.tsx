'use client';

import { SpinnerIcon } from '@socialincome/ui';

export const WizardLoading = () => {
	return (
		<div className="text-muted-foreground flex h-64 items-center justify-center">
			<SpinnerIcon className="h-6 w-6 animate-spin" />
		</div>
	);
};
