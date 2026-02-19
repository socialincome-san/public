import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import globeRotating from '../(assets)/globe.svg';
import ScrollToChevron from '../(components)/scroll-to-chevron';

export const HeroSection = async ({ lang }: DefaultParams) => {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-selection'],
	});

	return (
		<div className="theme-blue flex h-[calc(100svh)] min-h-[600px] flex-col">
			<div className="mt-[80px] flex flex-grow flex-col items-center justify-center p-6 text-center">
				<div className="pb-4">
					<Typography size="xl" className="opacity-60">
						{translator.t('section-1.subtitle')}
					</Typography>
				</div>
				<div className="max-w-3xl">
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
			</div>

			<div className="flex flex-grow items-start justify-center">
				<div className="flex flex-col items-center sm:flex-row sm:space-x-4">
					<Image className="h-12 w-12 md:h-20 md:w-20" src={globeRotating} alt="Globe Icon" />
					<div className="mx-auto my-4 max-w-4xl whitespace-pre text-center sm:text-left">
						<Typography as="span" color="accent" className="inline-block text-xl sm:text-2xl">
							{translator.t('section-1.population')} {translator.t('section-1.potential')}
						</Typography>
						<Typography as="span" className="block text-xl sm:text-2xl">
							{translator.t('section-1.scope')}
						</Typography>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center py-4 text-center">
				<Typography size="xl">{translator.t('section-1.continue')}</Typography>
				<div className="flex justify-center">
					<ScrollToChevron elementId="resources-section" />
				</div>
			</div>
		</div>
	);
};
