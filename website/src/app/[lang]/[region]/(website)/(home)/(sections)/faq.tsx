import { DefaultParams } from '@/app/[lang]/[region]';
import { FaqQuestion, FAQSection } from '@/components/legacy/faq/faq-section';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, linkCn } from '@socialincome/ui';
import Link from 'next/link';

export const FAQ = async ({ lang, region }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
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
			<div className="self-center">
				<Link
					className={linkCn({ variant: 'accent', arrow: 'internal', underline: 'none' })}
					href={`/${lang}/${region}/faq`}
				>
					{translator.t('section-faq.cta')}
				</Link>
			</div>
		</BaseContainer>
	);
}
