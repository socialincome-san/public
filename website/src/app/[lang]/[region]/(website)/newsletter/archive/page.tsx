import { getAllNewsletters } from '@/lib/newsletter';
import { NewsletterListClient } from './newsletter-list-client';
import { getMetadata } from '@/metadata';
import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-newsletter-archive');
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
			<Typography size="5xl" weight="bold" className="mt-2 mb-4">
				Newsletter Archive
			</Typography>
			<NewsletterListClient newsletters={newsletters} />
		</BaseContainer>
	);
}