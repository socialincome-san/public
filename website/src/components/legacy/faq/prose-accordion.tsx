import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Typography } from '@socialincome/ui';

type PrivacySectionProps = {
	title: string;
	items: {
		title: string;
		content: string;
	}[];
};

export const ProseAccordion = ({ title, items }: PrivacySectionProps) => {
	return (
		<div>
			<Typography as="h2" size="3xl" weight="bold">
				{title}
			</Typography>

			<Accordion type="single" collapsible className="w-full">
				{items.map((item, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>
							<Typography as="span" size="lg" className="text-left">
								{item.title}
							</Typography>
						</AccordionTrigger>
						<AccordionContent>
							<div className="prose" dangerouslySetInnerHTML={{ __html: item.content }} />
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
};
