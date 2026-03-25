import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/accordion';
import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { FaqSelection } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextLink from 'next/link';

type Props = {
	blok: FaqSelection;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const FaqSelectionBlock = ({ blok, lang, region }: Props) => {
	const { heading, questions } = blok;

	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, region) : null;

	const resolvedQuestions = questions.flatMap((questionReference) => {
		if (typeof questionReference === 'string') {
			return [];
		}

		const question = questionReference.content.question?.trim();
		if (!question) {
			return [];
		}

		return [
			{
				id: questionReference.uuid,
				question,
				answer: questionReference.content.answer?.trim(),
			},
		];
	});

	if (!resolvedQuestions.length && !button?.length) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="mx-auto max-w-4xl">
				{heading && <h2 className="mb-8 text-center text-4xl font-bold text-[#0d3652] md:mb-10 md:text-5xl">{heading}</h2>}
				<Accordion type="single" collapsible className="border-border/50 w-full border-t">
					{resolvedQuestions.map((item) => (
						<AccordionItem key={item.id} value={item.id} className="border-border/50">
							<AccordionTrigger className="py-5 text-lg font-medium text-[#0d3652] hover:no-underline md:text-2xl">
								{item.question}
							</AccordionTrigger>
							{item.answer && (
								<AccordionContent className="pb-5 text-base text-[#0d3652] md:text-lg">{item.answer}</AccordionContent>
							)}
						</AccordionItem>
					))}
				</Accordion>
				{button && buttonHref && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{button.label}</NextLink>
					</Button>
				)}
			</div>
		</BlockWrapper>
	);
};
