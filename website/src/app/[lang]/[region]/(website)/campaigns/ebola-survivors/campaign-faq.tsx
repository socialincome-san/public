'use client';

import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	BaseContainer,
	Typography,
} from '@socialincome/ui';

export async function CampaignFaq({ lang }: { lang: WebsiteLanguage }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign-ebola-survivors'],
	});

	return (
		<BaseContainer className="p-0">
			<div className="space-y-8">
				<Typography as="h2" size="2xl" weight="bold">
					{translator.t('faq.title')}
				</Typography>
				<div className="space-y-4">
					<Accordion type={'single'} collapsible className="w-full">
						{translator
							.t<{ question: string; answer: string }[]>('faq.questions')
							.map(({ question, answer }, index) => (
								<AccordionItem value={`item-${index}`} key={index}>
									<AccordionTrigger>
										<Typography as="h3" size="xl" weight="bold" className="text-left">
											{question}
										</Typography>
									</AccordionTrigger>
									<AccordionContent>
										<Typography as="p" className="mt-2" dangerouslySetInnerHTML={{ __html: answer }} />
									</AccordionContent>
								</AccordionItem>
							))}
					</Accordion>
				</div>
			</div>
		</BaseContainer>
	);
}
