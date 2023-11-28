'use client';

import { Card, CardContent, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Image from 'next/image';
import MossEarth from './(assets)/moss_earth.png';

type Card = {
	type: string;
	amount: string;
	gas: string;
	color?: string;
	weight?: string;
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
	partnerLink?: string;
};

type SectionCardProps = {
	tab: TabTranslation;
};

export function SectionCard({ tab }: SectionCardProps) {
	return tab.cards ? (
		<div className="flex w-3/5 flex-col space-y-4 text-left">
			{tab.cards.map((card, key) => {
				return (
					<Card
						key={key}
						className={classNames('bg-inherit pt-4 duration-200 ease-in md:hover:scale-105', card.color, {
							'text-white': card.href,
						})}
					>
						<CardContent className="flex justify-between text-left">
							<Typography as="span" size="lg" weight={card.weight}>
								{card.type}
							</Typography>
							<Typography as="span" size="lg" weight={card.weight}>
								{card.amount}
							</Typography>
							{card.href ? (
								<a href={card.href}>
									<u>
										<Typography as="span" size="lg" weight={card.weight}>
											{card.gas}
										</Typography>
									</u>
								</a>
							) : (
								<Typography as="span" size="lg" weight={card.weight}>
									{card.gas}
								</Typography>
							)}
						</CardContent>
					</Card>
				);
			})}
			<a href={tab.partnerLink} className="flex items-start justify-center space-x-2 pb-14 pt-10 text-blue-600">
				<Typography as="span">{tab.partner}</Typography>
				<Image src={MossEarth} alt="MossEarth" width={100} />
			</a>
		</div>
	) : (
		<div className="flex w-3/5 flex-col space-y-4">
			<Typography size="xl" weight="medium" color="muted-foreground">
				{tab.topic}
			</Typography>
			<Typography as="span" size="4xl" weight="bold">
				{tab.title}
			</Typography>
			<Typography size="2xl" weight="semibold" className="md:col-span-3">
				{tab.subtitle}
			</Typography>
			<a href={tab.href}>
				<Typography size="lg" className="text-blue-500">
					{tab.text}
				</Typography>
			</a>
		</div>
	);
}
