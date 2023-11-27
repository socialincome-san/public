import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { getMetadata } from "@/metadata";

export async function generateMetadata({ params }: DefaultPageProps) {
	return getMetadata(params.lang, 'website-how-to-reduce-income-inequality');
}
export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-how-to-reduce-income-inequality'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-6 pb-24 pt-10">
			<Typography as="h1" size="5xl" weight="bold" lineHeight="normal">
				{translator.t('title')}
			</Typography>
			<Typography as="h2" size="3xl" weight="medium" lineHeight="normal">
				{translator.t('lead')}
			</Typography>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs-1').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="xl" lineHeight="normal" />
				))}
			</div>
			<div className="space-y-4 border-b border-t py-10 text-center">
				<Typography size="4xl" lineHeight="normal">
					{translator.t('quote')}
				</Typography>
				<Typography size="xl" lineHeight="normal">
					{translator.t('quote-source')}
				</Typography>
			</div>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs-2').map((text, index) => (
					<Typography dangerouslySetInnerHTML={{ __html: text }} key={index} size="xl" lineHeight="normal" />
				))}
			</div>
			<Typography size="xl" lineHeight="normal">
				{translator.t('author')}
			</Typography>
			<Typography size="xl" lineHeight="normal" className="pt-8 border-t">
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
