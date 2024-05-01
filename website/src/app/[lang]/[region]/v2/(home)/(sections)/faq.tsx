import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@socialincome/ui/src/components/accordion2';
import Link from 'next/link';

type FaqQuestion = {
	prompt: string;
	answer: string;
	links: {
		title: string;
		href: string;
	}[];
};

export async function Faq({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	const questions = translator.t<FaqQuestion[]>('section-6.questions');

	return (
		<BaseContainer className="mb-40 mt-32">
			<Typography size="2xl" weight="medium" className="mb-12 text-center">
				{translator.t('section-6.title-1')}
			</Typography>
			<hr />
			<Accordion type="single" collapsible className="mb-10 w-full">
				{questions.map((question, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>
							<Typography size="lg">{question.prompt}</Typography>
						</AccordionTrigger>
						<AccordionContent className="text-popover-foreground">
							<Typography size="lg">{question.answer}</Typography>
							{question.links && (
								<ul className="mt-4 flex list-outside list-disc flex-col space-y-1 pl-3">
									{question.links?.map((link, index2) => (
										<li key={index2} className="mb-0 pl-3">
											<Link href={link.href} target="_blank" rel="noreferrer" className="no-underline">
												<Typography as="span" size="lg" color="foreground" className="font-normal hover:underline">
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
			<Link href={'/faq'}>
				<Typography color="accent" className="text-center">
					{translator.t('section-6.cta') + ' ›'}
				</Typography>
			</Link>
		</BaseContainer>
	);
}
