'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogTrigger,
	Typography,
} from '@socialincome/ui';
import Link from 'next/link';

type SectionCardProps = {
	titles: {
		main: string;
		articles: string;
		faqs: string;
	};
	items?: string[];
	paragraphs?: string[];
	articles?: { title: string; author: string; link: string }[];
	faqs?: { question: string; link: string }[];
};

export function SectionCard({ titles, items = [], paragraphs = [], articles = [], faqs = [] }: SectionCardProps) {
	return (
		<Dialog>
			<DialogTrigger>
				<Card className="text-left">
					<CardHeader>
						<CardTitle>{titles.main}</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid grid-cols-1 gap-4">
							{items.map((item, index) => (
								<li key={index} className="flex flex-row items-start space-x-2">
									<CheckCircleIcon className="h-8 w-8 flex-none" />
									<Typography size="xl">{item}</Typography>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</DialogTrigger>

			<DialogContent className="max-h-[80vh] max-w-screen-md overflow-y-auto">
				<div>
					<Typography as="h2" size="2xl" weight="bold">
						{titles.main}
					</Typography>
					<div className="flex flex-col space-y-8">
						{paragraphs.map((paragraph, index) => (
							<Typography key={index} as="p" size="lg">
								{paragraph}
							</Typography>
						))}
						{articles.length > 0 && (
							<div>
								<Typography size="xl" weight="medium">
									{titles.articles}
								</Typography>
								<div className="grid grid-cols-1 divide-y">
									{articles.map((article, index) => (
										<div key={index} className="py-4">
											<Typography>{article.author}</Typography>
											<Link href={article.link} target="_blank">
												<Typography color="secondary">{article.title}</Typography>
											</Link>
										</div>
									))}
								</div>
							</div>
						)}
						{faqs?.length > 0 && (
							<div>
								<Typography size="xl" weight="medium">
									{titles.faqs}
								</Typography>
								<div className="grid grid-cols-1 divide-y">
									{faqs.map((faq, index) => (
										<div key={index} className="py-4">
											<Link href={faq.link}>
												<Typography color="secondary">{faq.question}</Typography>
											</Link>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
