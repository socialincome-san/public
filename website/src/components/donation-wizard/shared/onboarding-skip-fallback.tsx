'use client';

import { Button } from '@socialincome/design-system/actions/button/button';

type OnboardingSkipFallbackProps = {
	onContinue: () => void;
	label: string;
};

export const OnboardingSkipFallback = ({ onContinue, label }: OnboardingSkipFallbackProps) => (
	<div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10">
		<Button type="button" onClick={onContinue}>
			{label}
		</Button>
	</div>
);
