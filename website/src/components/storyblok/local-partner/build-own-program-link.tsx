'use client';

import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';

type Props = {
	label: string;
};

/**
 * Opens the create-program wizard from a real button. The render-prop form of CreateProgramModal cannot be used
 * from a server component, so this thin client wrapper owns it and keeps the site's focus ring on the trigger.
 */
export const BuildOwnProgramLink = ({ label }: Props) => (
	<CreateProgramModal
		trigger={({ open }) => (
			<button
				type="button"
				onClick={open}
				aria-haspopup="dialog"
				data-testid="local-partner-programs-build-own"
				className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mt-4 self-start rounded-sm text-xs leading-4 underline underline-offset-2 transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
			>
				{label}
			</button>
		)}
	/>
);
