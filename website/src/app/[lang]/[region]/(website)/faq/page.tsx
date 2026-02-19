import { DefaultPageProps } from '@/app/[lang]/[region]';
import { FAQSection } from '@/components/legacy/faq/faq-section';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { BaseContainer, Typography } from '@socialincome/ui';

export const generateMetadata = async (props: DefaultPageProps) => {
	const params = await props.params;
	return getMetadata(params.lang as WebsiteLanguage, 'website-faq');
}

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-faq'] });

	return (
		<BaseContainer className="space-y-20">
			<Typography size="5xl" weight="bold">
				{translator.t('title')}
			</Typography>
			<FAQSection
				title={translator.t('fighting-poverty.title')}
				questions={translator.t('fighting-poverty.questions')}
			/>
			<FAQSection
				title={translator.t('striving-equality.title')}
				questions={translator.t('striving-equality.questions')}
			/>
			<FAQSection title={translator.t('solidarity.title')} questions={translator.t('solidarity.questions')} />
			<FAQSection title={translator.t('ubi.title')} questions={translator.t('ubi.questions')} />
			<FAQSection title={translator.t('contributors.title')} questions={translator.t('contributors.questions')} />
			<FAQSection title={translator.t('recipients.title')} questions={translator.t('recipients.questions')} />
			<FAQSection title={translator.t('selection.title')} questions={translator.t('selection.questions')} />
			<FAQSection title={translator.t('the-arts.title')} questions={translator.t('the-arts.questions')} />
			<FAQSection title={translator.t('volunteering.title')} questions={translator.t('volunteering.questions')} />
		</BaseContainer>
	);
}
