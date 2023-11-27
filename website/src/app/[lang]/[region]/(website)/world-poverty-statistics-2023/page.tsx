import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Link from 'next/link';

export default async function Page({ params : {lang,region}}: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-poverty-statistics-2023'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-12 pt-10 pb-24">
			<Typography as="h1" size="5xl" weight="bold" lineHeight="normal">
				{translator.t('title')}
			</Typography>
			<Typography as="h2" size="3xl" weight="medium" lineHeight="normal">
				{translator.t('lead')}
			</Typography>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="lg" lineHeight="normal"/>
				))}
			</div>
			<Typography size="lg" lineHeight="normal">
				{translator.t('author')}
			</Typography>
			<div className="py-16 text-center space-y-4 border-t border-b">
				<Typography size="5xl" lineHeight="normal">
					{translator.t('quote')}
				</Typography>
				<Typography size="lg" lineHeight="normal">
					{translator.t('quote-source')}
				</Typography>
			</div>
			<Typography size="2xl" lineHeight="normal">
				{translator.t('difference')}
			</Typography>
			<Link href={`${lang}/${region}/donate/individual`}>
				<Button size="lg" className="w-full">
					{translator.t('take-action')}
				</Button>
			</Link>
		</BaseContainer>
	);
}
