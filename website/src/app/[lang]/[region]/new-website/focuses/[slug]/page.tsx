import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function FocusPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const focusResult = await services.storyblok.getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	return <FocusDetail focus={focusResult.data} lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />;
}
