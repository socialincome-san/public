import { DefaultParams } from '@/app/[lang]/[region]';
import { FaqQuestion, FAQSection } from '@/components/faq/faq-section';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';

export async function FAQ({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'website-faq'],
	});

	return (
		<BaseContainer className="my-40 flex flex-col space-y-8">
			<FAQSection
				title={translator.t('section-faq.title')}
				questions={[
					...translator.t<FaqQuestion[]>('fighting-poverty.questions'),
					...translator.t<FaqQuestion[]>('striving-equality.questions'),
					...translator.t<FaqQuestion[]>('recipients.questions'),
				]}
			/>
			<Link href={'/faq'}>
				<Typography color="accent" className="text-center">
					{translator.t('section-faq.cta') + ' ›'}
				</Typography>
			</Link>
		</BaseContainer>
	);
}
