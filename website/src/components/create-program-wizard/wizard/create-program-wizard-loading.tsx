'use client';

import { Loader2 } from 'lucide-react';

export const WizardLoading = () => {
	return (
		<div className="text-muted-foreground flex h-64 items-center justify-center">
			<Loader2 className="h-6 w-6 animate-spin" />
		</div>
	);
};
