import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';

export type FaqQuestion = {
	question: string;
	answer: string;
	links?: {
		title: string;
		href: string;
	}[];
};

type FAQSectionProps = {
	title?: string;
	questions: FaqQuestion[];
};

export function FAQSection({ title, questions }: FAQSectionProps) {
	return (
		<div className="flex flex-col space-y-8">
			{title && (
				<Typography size="2xl" weight="medium" className="mx-auto">
					{title}
				</Typography>
			)}

			<Accordion type="single" collapsible className="w-full">
				{questions.map((question, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>
							<Typography size="lg" className="text-left">
								{question.question}
							</Typography>
						</AccordionTrigger>
						<AccordionContent className="prose prose-lg max-w-3xl">
							<Typography size="lg" className="text-left">
								{question.answer}
							</Typography>
							{question.links && (
								<ul className="mt-4 flex list-outside list-disc flex-col space-y-1 pl-3">
									{question.links?.map((link, index2) => (
										<li key={index2} className="mb-0 pl-3">
											<Link href={link.href} target="_blank" rel="noreferrer" className={linkCn({ size: "md", arrow: true, underline: "none"})} >
													{link.title}
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
