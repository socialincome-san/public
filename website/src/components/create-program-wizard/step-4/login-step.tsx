'use client';

import { Typography } from '@socialincome/ui';

type Props = {
	onSuccess: () => void;
};

export const LoginStep = ({ onSuccess }: Props) => {
	void onSuccess;

	return (
		<div className="flex flex-col items-center justify-center py-10">
			<Typography weight="bold" size="xl">
				Login Coming Soon
			</Typography>
		</div>
	);
};
