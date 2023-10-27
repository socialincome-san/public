import { DefaultPageProps } from '@/app/[lang]/[country]';
import { ClockIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});

	return (
		<BaseContainer className="mt-12 flex flex-col items-center space-y-4">
			<Typography as="h1" size="4xl" weight="bold" className="text-center w-2/3">
				{translator.t('section-1.title')}
				<div className="text-red-400">
					{translator.t('section-1.red-title')}
				</div>
			</Typography>
			<Typography as="h2" size="xl" className="max-w-2xl text-center">
				{translator.t('section-1.subtitle')}
			</Typography>
		</BaseContainer>
	);
}
