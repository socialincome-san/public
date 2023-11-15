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

type TextFragment = {
	text: string;
	href?: string;
};
type Paragraph = TextFragment[];
type SectionCardProps = {
	title: string;
	description: string;
	paragraphs: Paragraph[];
	takeAction: string;
};

export function SectionCard({ title, description, paragraphs, takeAction }: SectionCardProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Card className="w-full scale-100 border border-black bg-inherit px-10 py-4 text-left duration-200 ease-in hover:scale-105">
					<CardTitle className="py-2 text-red-400 ">{title}</CardTitle>
					<Typography size="lg">{description}</Typography>
				</Card>
			</DialogTrigger>
			<DialogContent className="w-full">
				<DialogHeader>
					<DialogTitle>
						<Typography size="2xl" weight="bold">
							{title}
						</Typography>
					</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					{paragraphs.map((paragraph, key) => (
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
					<Link href="/get-involved">
						<Button>{takeAction}</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
