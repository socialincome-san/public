'use client';

import { Typography } from '@socialincome/ui';
import Link from 'next/link';

export type CardTranslation = {
	title: string;
	description: string;
	links: {
		icon: string;
		text: string;
		href: string;
	}[];
};

type SectionCardProps = {
	card: CardTranslation;
};

export function SectionCard({ card }: SectionCardProps) {
	return (
		<div className="my-5 flex w-1/2 flex-col space-y-5 ">
			<Typography size="3xl" weight="bold">
				{card.title}{' '}
			</Typography>
			<Typography size="xl" className="w-5/6">
				{card.description}
			</Typography>
			{card.links.map((link, key) => {
				return (
					<div key={key}>
						<Link href={link.href}>
							{/*<span className='pr-3'>{link.icon}</span>*/}
							<span className="flex items-baseline">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="pr-3">
									<path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z" />
								</svg>
								<Typography as="span" size="xl">
									{link.text}
								</Typography>
							</span>
						</Link>
					</div>
				);
			})}
		</div>
	);
}
