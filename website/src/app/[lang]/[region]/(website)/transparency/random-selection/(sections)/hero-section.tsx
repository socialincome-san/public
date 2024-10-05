import { DefaultParams } from '@/app/[lang]/[region]';
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
		<div className="theme-blue bg-background relative flex h-screen items-center justify-center">
			<div className="text-center">
				<div className="mb-2">
					<Typography
						size="xl"
						className="mb-8 opacity-50">
						{translator.t('section-1.subtitle')}
					</Typography>
				</div>

				<div className="mx-auto max-w-2xl mb-20">
					{translator.t<{ text: string; color?: FontColor }[]>('section-1.title').map((title, index) => (
						<Typography
							key={index}
							as="span"
							weight="medium"
							color={title.color}
							className="text-3xl sm:text-4xl md:text-4xl"
						>
							{title.text}{' '}
						</Typography>
					))}
				</div>

				<div className="mt-20 flex flex-col md:flex-row items-center justify-center">
					<div className="mt-1 mb-4 mr-3 md:mb-0 flex-shrink-0">
						<Image
							className="h-16 w-16"
							src={globeRotating}
							alt="Globe"
						/>
					</div>

					<div className="text-center md:text-left">
						<div className="mx-auto max-w-4xl text-white whitespace-pre">
							<Typography
								as="span"
								color="accent"
								className="text-xl inline-block whitespace-pre"
							>
								{translator.t('section-1.population')} {translator.t('section-1.potential')}
							</Typography>

							<Typography
								as="span"
								className="text-xl whitespace-pre block"
							>
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
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}