'use client';

import { Button } from '@/components/button';
import { Typography } from '@socialincome/ui';

type Props = {
	onGoToLogin: () => void;
};

export const SuccessStep = ({ onGoToLogin }: Props) => {
	return (
		<div className="mx-auto max-w-2xl space-y-5 py-2 text-center">
			<div className="space-y-2">
				<Typography size="xl" weight="bold">
					Your program is ready
				</Typography>
				<Typography className="text-muted-foreground">
					We created your account, organization, and initial program setup. Next, log in with your email to open your
					dashboard and start managing your program.
				</Typography>
			</div>

			<div className="flex justify-center">
				<Button onClick={onGoToLogin}>Go to login</Button>
			</div>
		</div>
	);
};
