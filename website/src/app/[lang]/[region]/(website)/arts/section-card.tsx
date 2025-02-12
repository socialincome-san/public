'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';

export type CardTranslation = {
	title: string;
	description: string;
	links: {
		text: string;
		href: string;
	}[];
};

type SectionCardProps = {
	card: CardTranslation;
};

export function SectionCard({ card }: SectionCardProps) {
	return (
		<div className="flex flex-col space-y-2">
			<Typography size="3xl" weight="bold">
				{card.title}{' '}
			</Typography>
			<Typography size="xl" className="w-5/6">
				{card.description}
			</Typography>
			{card.links.map((link, key) => {
				return (
					<div key={key}>
						<Link className={linkCn()} href={link.href} target="_blank">
							<span className="flex items-center">
								<CheckCircleIcon className="mr-2 h-8 w-8" />
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
