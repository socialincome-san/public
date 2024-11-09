import { DefaultParams } from '@/app/[lang]/[region]';
import ScrollToChevron from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/(components)/scroll-to-chevron';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import globeRotating from '../(assets)/globe.svg';

export async function HeroSection({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-selection'],
	});

	return (
		<div className="theme-blue bg-background relative flex h-[calc(100svh)] items-center justify-center">
			<div className="text-center">
				<div className="mb-2">
					<Typography size="xl" className="mb-8 opacity-50">
						{translator.t('section-1.subtitle')}
					</Typography>
				</div>

				<div className="mx-auto mb-20 max-w-2xl">
					{translator.t<{ text: string; color?: FontColor }[]>('section-1.title').map((title, index) => (
						<Typography
							key={index}
							as="span"
							weight="medium"
							color={title.color}
							className="text-3xl sm:text-4xl md:text-4xl"
						>
							{title.text}
						</Typography>
					))}
				</div>

				<div className="mt-20 flex flex-col items-center justify-center md:flex-row">
					<div className="mb-4 mr-3 mt-1 flex-shrink-0 md:mb-0">
						<Image className="h-16 w-16" src={globeRotating} alt="Globe" />
					</div>

					<div className="text-center md:text-left">
						<div className="mx-auto max-w-4xl whitespace-pre text-white">
							<Typography as="span" color="accent" className="inline-block whitespace-pre text-xl">
								{translator.t('section-1.population')} {translator.t('section-1.potential')}
							</Typography>

							<Typography as="span" className="block whitespace-pre text-xl">
								{translator.t('section-1.scope')}
							</Typography>
						</div>
					</div>
				</div>

				<div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 transform text-center">
					<Typography size="xl" className="mb-2">
						{translator.t('section-1.continue')}
					</Typography>
					<div className="flex justify-center">
						<ScrollToChevron elementId="resources-section" />
					</div>
				</div>
			</div>
		</div>
	);
}
