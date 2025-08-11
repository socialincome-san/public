import { notFound } from 'next/navigation';
import { getNewsletterHTML } from '@/lib/newsletter';
import Link from 'next/link';
import { linkCn } from '@socialincome/ui';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import type { DefaultParams } from '@/app/[lang]/[region]';

function sanitizeNewsletterHtml(raw: string) {
	if (!raw) return raw;
	let out = raw.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
	out = out.replace(/<head[\s\S]*?<\/head>/gi, '');
	out = out.replace(/<\/?html[^>]*>/gi, '');
	out = out.replace(/<body[^>]*>/gi, '');
	out = out.replace(/<\/body>/gi, '');
	return out.trim();
}

type RouteParams = DefaultParams & { slug: string };

export default async function Page(props: { params: Promise<RouteParams> }) {
	const { lang, slug } = await props.params; // region removed (unused)

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-newsletter'],
	});

	const htmlRaw = getNewsletterHTML(slug);
	if (!htmlRaw) notFound();

	const html = sanitizeNewsletterHtml(htmlRaw);
	if (!html) notFound();

	return (
		<div className="max-w-4xl mx-auto p-4" suppressHydrationWarning>
			<Link href="/newsletter/archive" className={linkCn({ underline: 'hover' })}>
				← {translator.t('archive.title')}
			</Link>
			<div className="mt-8" dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
}