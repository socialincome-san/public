'use client';

import type { ActionButton } from '@/generated/storyblok/types/109655/storyblok-components';
import { Button, useGlowHover } from '@socialincome/ui';
import Link from 'next/link';

export function StoryblokActionButton({ text, url, primaryStyle, _uid, glowEffect }: ActionButton) {
	return (
		<div className="my-10 flex w-full justify-center">
			<Link key={_uid} href={url} target="_blank" className="no-underline" rel="noopener noreferrer">
				<Button
					variant={primaryStyle ? 'default' : 'secondary'}
					className="mx-auto hover:text-black"
					ref={useGlowHover({ lightColor: '#CEFF00', disabled: !glowEffect })}
				>
					{text}
				</Button>
			</Link>
		</div>
	);
}
