'use client';

import {
	Card,
	CardContent,
	CardHeader,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
	Typography,
} from '@socialincome/ui';
import Image from 'next/image';
import sdgLogo from './sdg-logo.svg';

type SectionCardProps = {
	title: string;
	description: string;
	paragraphs?: string[];
};

export function SectionCard({ title, description, paragraphs = [] }: SectionCardProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Card className="border-foreground my-4 cursor-pointer bg-red-50 lg:mx-4">
					<CardHeader>
						<Typography size="2xl" weight="bold" color="secondary-foreground">
							{title}
						</Typography>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
							<div className="flex flex-row items-start space-x-2">
								<Typography size="3xl" weight="bold">
									{description}
								</Typography>
							</div>
							<Image className="w-auto max-w-xs" src={sdgLogo} alt="Sustainable Development Goals Logo" />
						</div>
					</CardContent>
				</Card>
			</DialogTrigger>
			<DialogContent className="w-11/12 max-w-3xl">
				<DialogHeader>
					<Typography as="h2" size="2xl" weight="bold">
						{description}
					</Typography>
				</DialogHeader>
				<div className="flex flex-col space-y-8">
					{paragraphs.map((paragraph, index) => (
						<Typography key={index} as="p" size="lg">
							{paragraph}
						</Typography>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
