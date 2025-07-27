'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { Typography } from '@socialincome/ui';
import { useState } from 'react';

export function PreviewMessage() {
	const [visible, setVisible] = useState(true);

	if (!visible) return null;

	return (
		<span className="text-shadow-md bg- bg-accent fixed left-5 top-72 z-[10000] w-[150px] rounded-md p-2 shadow-lg">
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
}
