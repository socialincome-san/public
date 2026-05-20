import { DefaultParams } from '@/app/[lang]/[region]';
import { createNewWebsiteJournalTagLink } from '@/lib/services/storyblok/storyblok.utils';
import { redirect } from 'next/navigation';

type PageParams = { slug: string } & DefaultParams;

export default async function Page({ params }: { params: Promise<PageParams> }) {
	const { slug, lang, region } = await params;

	redirect(createNewWebsiteJournalTagLink(slug, lang, region));
}
