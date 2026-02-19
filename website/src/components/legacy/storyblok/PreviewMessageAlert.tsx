'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { Typography } from '@socialincome/ui';
import { useState } from 'react';

export const PreviewMessage = () => {
	const [visible, setVisible] = useState(true);

	if (!visible) {
		return null;
	}

	return (
		<span className="bg-accent fixed top-72 left-5 z-[10000] w-[150px] rounded-md p-2 shadow-lg text-shadow-md">
			<Typography as="span" weight="bold">
				Preview Mode
			</Typography>
			<XMarkIcon
				width="15"
				height="25"
				className="ml-1 inline cursor-pointer underline"
				onClick={() => setVisible(false)}
			/>

			<Typography size="xs">
				Published changes will take several minutes to be applied. Unpublished stories will be visible.
			</Typography>
		</span>
	);
};
