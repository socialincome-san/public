'use client';

import { Button, Card, FontWeight, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import MossEarth from './(assets)/moss_earth.png';

type Card = {
	type: string;
	amount: string;
	gas: string;
	weight?: FontWeight;
	theme?: string;
	href?: string;
};

export type TabTranslation = {
	trigger: string;
	topic?: string;
	title?: string;
	subtitle?: string;
	text?: string;
	href?: string;
	cards?: Card[];
	partner?: string;
	partnerLink: string;
};

type SectionCardProps = {
	tab: TabTranslation;
};

export function SectionCard({ tab }: SectionCardProps) {
	return tab.cards ? (
		<div className="flex flex-col space-y-4 px-4 py-2">
			{tab.cards.map((card, key) => {
				const cardContent = (
					<>
						<Typography as="span" size="lg" weight={card.weight}>
							{card.type}:{' '}
						</Typography>
						<Typography as="span" size="lg" weight={card.weight}>
							{card.amount}{' '}
						</Typography>
						<Typography as="span" size="lg" weight={card.weight}>
							{card.gas}
						</Typography>
					</>
				);
				return (
					<div key={key} className={classNames('rounded-lg border px-8 py-4', card.theme)}>
						{card.href ? (
							<Link href={card.href} target="_blank">
								{cardContent}
							</Link>
						) : (
							<>{cardContent}</>
						)}
					</div>
				);
			})}
			{tab.partnerLink && (
				<Link href={tab.partnerLink} target="_blank" className="flex items-start justify-center space-x-2 pb-14 pt-10">
					<Typography as="span">{tab.partner}</Typography>
					<Image src={MossEarth} alt="MossEarth" width={100} />
				</Link>
			)}
		</div>
	) : (
		<div className="flex flex-col space-y-4 px-2 py-2 md:px-16">
			<Typography size="xl" weight="medium" color="muted-foreground">
				{tab.topic}
			</Typography>
			<Typography weight="medium" size="2xl">
				{tab.title}
			</Typography>
			<Typography size="xl">{tab.subtitle}</Typography>
			{tab.href && (
				<Link href={tab.href} target="_blank" className="self-center">
					<Button variant="link">{tab.text}</Button>
				</Link>
			)}
		</div>
	);
}
