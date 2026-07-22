import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import { Translator } from '@/lib/i18n/translator';
import { services } from '@/lib/services/services';
import { LanguageCode } from '@/lib/types/language';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; region: string }> }) {
	const { slug, lang, region } = await props.params;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-common'],
	});

	const pageResult = await services.journal.getPersonPageData(
		lang,
		region,
		slug,
		translator.t('overview.title'),
		translator.t('breadcrumb.home', { namespace: 'website-common' }),
	);

	if (!pageResult.success) {
		notFound();
	}

	return (
		<PersonProfile
			{...pageResult.data}
			articlesHeading={translator.t('person.articles')}
			lang={lang}
			region={region}
			moreArticlesLabel={translator.t('overview.more-articles')}
			videoLabel={translator.t('badge.video')}
		/>
	);
}
