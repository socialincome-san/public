import { DefaultPageProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Image from 'next/image';
import phonesGif from './phones.gif';

export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer className="bg-base-blue">
			<div className="flex min-h-[calc(100vh-theme(spacing.20))] flex-col items-center lg:flex-row">
				<Image className="flex-1 px-16 py-4" src={phonesGif} alt="Change animation" style={{ objectFit: 'cover' }} />
				<div className="flex flex-1 flex-col justify-center p-4 text-center lg:p-8 lg:text-left">
					<Typography as="span" size="4xl" weight="bold" lineHeight="relaxed">
						{translator?.t('section-1.title-1')}
					</Typography>
					<Typography as="span" size="4xl" weight="bold" color="accent" lineHeight="relaxed">
						{translator?.t('section-1.title-2')}
					</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
