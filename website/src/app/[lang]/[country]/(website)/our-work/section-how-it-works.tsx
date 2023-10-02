import { DefaultPageProps } from '@/app/[lang]/[country]';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import _ from 'lodash';
import Image from 'next/image';
import phonesGif from './(assets)/phones-2.gif';

export async function SectionHowItWorks({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-our-work'],
	});

	return (
		<BaseContainer id="how-it-works" backgroundColor="bg-red-50" className="min-h-screen">
			<div className="flex min-h-screen flex-col justify-center">
				<Typography as="h1" size="4xl" weight="bold" color="secondary-foreground">
					{translator.t('section-how-it-works.title')}
				</Typography>
				<div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
					<Image src={phonesGif} alt="Change animation" />
					<div className="space-y-4 md:p-4">
						<Typography as="h2" size="3xl" weight="bold">
							{translator.t('section-how-it-works.subtitle')}
						</Typography>
						<ul className="flex flex-col space-y-4">
							{_.range(1, 5).map((i) => (
								<li key={i} className="flex flex-row items-start space-x-3">
									<CheckCircleIcon className="text-secondary h-8 w-8 flex-none" />
									<Typography size="xl">{translator.t(`section-how-it-works.item-${i}`)}</Typography>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
