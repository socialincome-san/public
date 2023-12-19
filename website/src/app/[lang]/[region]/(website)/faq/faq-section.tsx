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
							<Typography size="lg" className="text-left">
								{question.question}
							</Typography>
						</AccordionTrigger>
						<AccordionContent className="prose">
							<Typography size="lg" className='text-left'>{question.answer}</Typography>
							{question.links && (
								<ul className="mt-4 flex list-outside list-disc flex-col space-y-1 pl-3">
									{question.links?.map((link, index2) => (
										<li key={index2} className='pl-3 mb-0'>
											<Link href={link.href} target="_blank" rel="noreferrer" className="no-underline">
												<Typography as="span" size="lg" color="primary" className="font-normal hover:underline">
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
