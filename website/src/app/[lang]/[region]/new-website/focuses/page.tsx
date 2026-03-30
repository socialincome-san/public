import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getFocusId } from '@/components/storyblok/focus/focus.utils';
import { FocusesOverview } from '@/components/storyblok/focus/focuses-overview';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

export const revalidate = 900;

export default async function FocusesPage({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const focusesResult = await services.storyblok.getFocuses(lang);
	const focuses = focusesResult.success ? focusesResult.data : [];
	const focusIds = [...new Set(focuses.map((focus) => getFocusId(focus.content)).filter(Boolean))];
	const statsResult = await services.read.focus.getPublicFocusStatsByIds(focusIds);
	const statsById = statsResult.success ? statsResult.data : {};

	return (
		<FocusesOverview
			focuses={focuses}
			statsById={statsById}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
		/>
	);
}
