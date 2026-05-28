'use client';

import { Button } from '@/components/button';
import type { FaqItem } from '@/components/content-blocks/faq-selection.utils';
import { SectionHeading } from '@/components/section-heading';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import NextLink from 'next/link';

type FaqCta = {
	href: string;
	label: string;
};

type Props = {
	heading?: string;
	items: FaqItem[];
	cta?: FaqCta;
};

export const FaqSelectionContent = ({ heading, items, cta }: Props) => {
	if (!items.length) {
		return null;
	}

	return (
		<div className="mx-auto max-w-4xl">
			{heading && <SectionHeading bold>{heading}</SectionHeading>}
			<RadixAccordion.Root type="single" collapsible className="border-input w-full border-b">
				{items.map((item) => (
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
			{cta && (
				<div className="mt-6 flex justify-center">
					<Button variant="outline" asChild>
						<NextLink href={cta.href}>{cta.label}</NextLink>
					</Button>
				</div>
			)}
		</div>
	);
};
