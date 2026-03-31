'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { FaqSelection } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { ChevronDownIcon } from 'lucide-react';
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

	if (!resolvedQuestions.length) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="mx-auto max-w-4xl">
				{heading && <h2 className="mb-8 text-center text-4xl font-bold text-[#0d3652] md:mb-10 md:text-5xl">{heading}</h2>}
				<RadixAccordion.Root type="single" collapsible className="border-input w-full border-b">
					{resolvedQuestions.map((item) => (
						<RadixAccordion.Item key={item.id} value={item.id} className="border-input border-b last:border-b-0">
							<RadixAccordion.Header className="flex">
								<RadixAccordion.Trigger className="group text-primary flex flex-1 items-start justify-between gap-4 py-6 text-lg md:text-xl">
									{item.question}
									<ChevronDownIcon className="pointer-events-none mt-1 size-6 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
								</RadixAccordion.Trigger>
							</RadixAccordion.Header>
							{item.answer && (
								<RadixAccordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down text-primary overflow-hidden md:text-lg">
									<div className="pb-6">{item.answer}</div>
								</RadixAccordion.Content>
							)}
						</RadixAccordion.Item>
					))}
				</RadixAccordion.Root>
				{button && buttonHref && (
					<div className="mt-6 flex justify-center">
						<Button variant="outline" asChild>
							<NextLink href={buttonHref}>{button.label}</NextLink>
						</Button>
					</div>
				)}
			</div>
		</BlockWrapper>
	);
};
