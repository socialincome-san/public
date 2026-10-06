import { buildVolunteerDurationConfig, PersonProfile } from '@/components/storyblok/journal/person-profile';
import { Translator } from '@/lib/i18n/translator';
import { resolveWebsiteLanguage } from '@/lib/i18n/utils';
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
		translator.t('person.breadcrumb'),
		translator.t('breadcrumb.home', { namespace: 'website-common' }),
	);

	if (!pageResult.success) {
		notFound();
	}

	return (
		<PersonProfile
			{...pageResult.data}
			articlesHeading={translator.t('person.articles')}
			profileTranslations={{
				role: translator.t('person.role'),
				circles: translator.t('person.circles'),
				activeCircle: translator.t('person.circle-active'),
				interestedCircle: translator.t('person.circle-interested'),
				commitment: translator.t('person.commitment'),
				workStyle: translator.t('person.work-style'),
				likesDeadline: translator.t('person.likes-deadline'),
				likesDeadlineYes: translator.t('person.likes-deadline-yes'),
				likesDeadlineNo: translator.t('person.likes-deadline-no'),
				timeCommitment: translator.t('person.time-commitment'),
				timeCommitmentUnit: translator.t('person.time-commitment-unit'),
			}}
			volunteerDuration={buildVolunteerDurationConfig(translator, resolveWebsiteLanguage({ pathnameLanguage: lang }))}
			lang={lang}
			region={region}
			moreArticlesLabel={translator.t('overview.more-articles')}
			videoLabel={translator.t('badge.video')}
		/>
	);
}
