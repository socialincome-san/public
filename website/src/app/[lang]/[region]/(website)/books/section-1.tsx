import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ClockIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';

export default async function Section1({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-books'] });

	return (
		<BaseContainer className="mt-12 flex flex-col items-center space-y-4">
			<Typography as="h1" size="4xl" weight="bold" className="text-center">
				{translator.t('section-1.title')}
			</Typography>
			<Typography as="h2" size="xl" className="max-w-2xl">
				{translator.t('section-1.subtitle-1')}
			</Typography>
			<Typography as="h2" size="xl" className="max-w-2xl">
				{translator.t('section-1.subtitle-2')}
				<Link className={linkCn()} href="mailto: hello@socialincome.org">
					{translator.t('section-1.subtitle-3')}
				</Link>
			</Typography>
			<div className="flex items-center">
				<ClockIcon className="mr-2 h-5 w-5" />
				<Typography size="sm" color="muted-foreground">
					{translator.t('section-1.lastUpdate')}
				</Typography>
			</div>
		</BaseContainer>
	);
}
