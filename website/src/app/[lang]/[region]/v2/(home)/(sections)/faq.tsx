import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, BaseContainer, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Link from 'next/link';

type FaqQuestion = {
	prompt: string,
	answer: string,
	links: {
		title: string,
		href: string
	}[]
};

export async function Faq({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2'],
	});

	const questions = translator.t<FaqQuestion[]>('section-6.questions');

	return (
		<BaseContainer>
			<Typography size='2xl' className='text-center mb-12'>{translator.t('section-6.title-1')}</Typography>
			<hr/>
			<Accordion type="single" collapsible className="w-full mb-10">
				{questions.map((question, index) => (
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>
							<Typography size="lg" className="text-left">
								{question.prompt}
							</Typography>
						</AccordionTrigger>
						<AccordionContent className="prose">
							<Typography size="lg" className="text-left">
								{question.answer}
							</Typography>
							{question.links && (
								<ul className="mt-4 flex list-outside list-disc flex-col space-y-1 pl-3">
									{question.links?.map((link, index2) => (
										<li key={index2} className="mb-0 pl-3">
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
			<Link href={'/faq'}>
				<Typography color='accent' className='text-center'>{translator.t('section-6.cta')+' ›'}</Typography>
			</Link>
		</BaseContainer>
	);
}
