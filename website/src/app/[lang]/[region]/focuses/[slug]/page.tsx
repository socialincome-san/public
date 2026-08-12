import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { notFound } from 'next/navigation';

export const revalidate = 900;

type FocusPageProps = DefaultLayoutPropsWithSlug & SearchParamsPageProps;

export default async function FocusPage({ params, searchParams }: FocusPageProps) {
	const { slug, lang } = await params;
	const focusResult = await services.storyblok.getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	return <FocusDetail focus={focusResult.data} searchParams={await searchParams} />;
}
