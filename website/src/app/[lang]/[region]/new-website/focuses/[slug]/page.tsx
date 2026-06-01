import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function FocusPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const focusResult = await services.storyblok.getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	return <FocusDetail focus={focusResult.data} />;
}
