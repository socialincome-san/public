import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getAllNewsletters } from '@/lib/newsletter';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography, linkCn } from '@socialincome/ui';
import Link from 'next/link';
import { NewsletterListClient } from './newsletter-list-client';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-newsletter');
}

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;
	const { lang } = params;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-newsletter'],
	});

	const newsletters = getAllNewsletters();

	return (
		<BaseContainer className="py-10">
			<Link
				href="/newsletter"
				className={linkCn({
					underline: 'hover',
				})}
			>
				← {translator.t('archive.signup-link')}
			</Link>
			<Typography size="5xl" weight="bold" className="mb-12 mt-8">
				{translator.t('archive.title')}
			</Typography>
			<NewsletterListClient newsletters={newsletters} />
		</BaseContainer>
	);
}
