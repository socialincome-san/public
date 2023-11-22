'use client';

import {
	Button,
	Card,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Typography,
} from '@socialincome/ui';
import Link from 'next/link';

export type CardTranslation = {
	title: string;
	description: string;
	paragraphs: {
		text: string;
		href?: string;
	}[][];
};

type SectionCardProps = {
	translations: { card: CardTranslation; takeAction: string };
};

export function SectionCard({ translations: { card, takeAction } }: SectionCardProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Card className="w-full px-10 py-4 text-left duration-200 ease-in md:hover:scale-105">
					<CardTitle className="py-2 text-red-400 ">{card.title}</CardTitle>
					<Typography size="lg">{card.description}</Typography>
				</Card>
			</DialogTrigger>
			<DialogContent className="w-full">
				<DialogHeader>
					<DialogTitle>
						<Typography size="2xl" weight="bold">
							{card.title}
						</Typography>
					</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					{card.paragraphs.map((paragraph, key) => (
						<p key={key} className="mt-2">
							{paragraph.map((fragment, key) => (
								<span key={key}>
									{fragment.href ? (
										<Link href={fragment.href}>
											<Typography as="span" color="primary">
												{fragment.text}
											</Typography>
										</Link>
									) : (
										<Typography as="span">{fragment.text}</Typography>
									)}
								</span>
							))}
						</p>
					))}
					<br />
				</DialogDescription>
				<DialogFooter>
					<Link href="/donate/individual">
						<Button>{takeAction}</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
