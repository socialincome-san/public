'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Typography } from '@socialincome/ui';
import Link from 'next/link';

type FAQSectionProps = {
	title: string;
	questions: {
		question: string;
		answer: string;
		links?: {
			title: string;
			href: string;
		}[];
	}[];
};

export function FAQSection({ title, questions }: FAQSectionProps) {
	return (
		<div>
			<Typography as="h2" size="3xl" weight="bold">
				{title}
			</Typography>

			<Accordion type="single" collapsible className="w-full">
				{questions.map((question, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>
							<Typography size="lg">{question.question}</Typography>
						</AccordionTrigger>
						<AccordionContent>
							<Typography className="prose">{question.answer}</Typography>

							{question.links && (
								<ul className="mt-4 flex list-inside list-disc flex-col space-y-1">
									{question.links?.map((link, index2) => (
										<li key={index2}>
											<Link href={link.href} target="_blank" rel="noreferrer">
												<Typography as="span" color="primary" className="hover:underline">
													{link.title}
												</Typography>
											</Link>
										</li>
									))}
								</ul>
							)}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
