'use client';

import type { ActionButton } from '@/generated/storyblok/types/109655/storyblok-components';
import { Button } from '@socialincome/design-system/button/button';
import Link from 'next/link';

export const ActionButtonBlock = ({ text, url, primaryStyle, _uid }: ActionButton) => (
	<div className="my-10 flex w-full justify-center">
		<Button variant={primaryStyle ? 'default' : 'outline'} asChild>
			<Link href={url} target="_blank" rel="noopener noreferrer" key={_uid}>
				{text}
			</Link>
		</Button>
	</div>
);
