import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Link from 'next/link';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-poverty-statistics-2023'],
	});

	return (
		<BaseContainer className="mx-auto flex max-w-2xl flex-col space-y-12 py-16">
			<Typography as="h1" size="5xl" weight="bold" className="leading-normal">
				{translator.t('title')}
			</Typography>
			<Typography as="h2" size="3xl" weight="semibold" className="leading-normal">
				{translator.t('lead')}
			</Typography>
			<div className="flex flex-col space-y-4">
				{translator.t<string[]>('paragraphs').map((text, index) => (
					<Typography as="h3" key={index} size="2xl" className="leading-normal">
						{text}
					</Typography>
				))}
			</div>
			<Typography size="xl" className="leading-normal">
				{translator.t('author')}
			</Typography>
			<hr className="my-4" />
			<div className="p-4">
				<Typography size="5xl" className="my-4 text-center leading-normal">
					{translator.t('quote')}
				</Typography>
				<Typography size="xl" className="mb-4 text-center leading-normal">
					{translator.t('quote-source')}
				</Typography>
			</div>
			<hr className="my-4" />
			<Typography size="2xl" className="leading-normal">
				{translator.t('difference')}
			</Typography>
			<Link href="/donate/individual">
				<Button size="lg" className="w-full">
					{translator.t('take-action')}
				</Button>
			</Link>
		</BaseContainer>
	);
}
