'use client';
import { ActionButton } from '@socialincome/shared/src/storyblok/journal';
import { Button, useGlowHover } from '@socialincome/ui';
import Link from 'next/link';

export function StoryblokActionButton({ text, url, primaryStyle }: ActionButton) {
	return (
		<div className="my-10 flex w-full justify-center">
			<Link href={url} target="_blank" className="no-underline">
				<Button
					variant={primaryStyle ? 'default' : 'secondary'}
					className="mx-auto hidden hover:text-black md:block"
					ref={useGlowHover({ lightColor: '#CEFF00' })}
				>
					{text}
				</Button>
			</Link>
		</div>
	);
}
