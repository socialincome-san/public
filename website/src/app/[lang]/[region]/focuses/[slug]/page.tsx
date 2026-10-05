import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import type { SearchParamsPageProps } from '@/app/page-props';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getFocusBySlug } from '@/modules/storyblok-content/storyblok-content.service';
import { notFound } from 'next/navigation';

export const revalidate = 900;

type FocusPageProps = DefaultLayoutPropsWithSlug & SearchParamsPageProps;

export default async function FocusPage({ params, searchParams }: FocusPageProps) {
	const { slug, lang, region } = await params;
	const focusResult = await getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	return (
		<FocusDetail
			focus={focusResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={await searchParams}
		/>
	);
}
