'use client';
import { Button, useGlowHover } from '@socialincome/ui';
import Link from 'next/link';

export function StoryblokActionButton({ text, url }: { text: string; url: string }) {
	return (
		<div className="my-10 flex w-full justify-center">
			<Link href={url} target="_blank" className="no-underline">
				<Button className="mx-auto hidden hover:text-black md:block" ref={useGlowHover({ lightColor: '#CEFF00' })}>
					{text}
				</Button>
			</Link>
		</div>
	);
}
