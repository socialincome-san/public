import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Link from 'next/link';

export async function generateMetadata({ params }: DefaultPageProps) {
	return getMetadata(params.lang, 'website-what-is-poverty');
}

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-what-is-poverty'],
	});

	return (
		<BaseContainer className="mx-auto mt-16 flex max-w-2xl flex-col space-y-6 pb-24 pt-10">
			<Typography as="h1" size="5xl" weight="bold" lineHeight="normal">
				{translator.t('title')}
			</Typography>
			<Typography as="h2" size="3xl" weight="medium" lineHeight="normal" className="py-5">
				{translator.t('lead')}
			</Typography>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs-1').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="xl" lineHeight="normal" />
				))}
			</div>
			<div className="space-y-4 border-b border-t py-10 text-center">
				<Typography size="4xl" lineHeight="normal">
					{translator.t('quote-1')}
				</Typography>
				<Typography size="xl" lineHeight="normal">
					{translator.t('quote-source-1')}
				</Typography>
			</div>
			<Typography size="xl" weight="medium" lineHeight="normal">
				{translator.t('subtitle-1')}
			</Typography>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs-2').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="xl" lineHeight="normal" />
				))}
			</div>
			<Typography size="xl" weight="medium" lineHeight="normal">
				{translator.t('subtitle-2')}
			</Typography>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs-3').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="xl" lineHeight="normal" />
				))}
			</div>
			<div className="space-y-4 border-b border-t py-10 text-center">
				<Typography size="4xl" lineHeight="normal">
					{translator.t('quote-2')}
				</Typography>
				<Typography size="xl" lineHeight="normal">
					{translator.t('quote-source-2')}
				</Typography>
			</div>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs-4').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="xl" lineHeight="normal" />
				))}
			</div>
			<Typography size="xl" lineHeight="normal">
				{translator.t('author')}
			</Typography>
			<Typography size="xl" lineHeight="normal" className="border-t pt-8">
				{translator.t('difference')}
			</Typography>
			<Link href={`/${lang}/${region}/donate/individual`}>
				<Button size="lg" className="w-full">
					{translator.t('take-action')}
				</Button>
			</Link>
		</BaseContainer>
	);
}
