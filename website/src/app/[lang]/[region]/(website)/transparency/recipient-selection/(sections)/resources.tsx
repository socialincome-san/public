import { DefaultParams } from '@/app/[lang]/[region]';
import ScrollToChevron from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/(components)/scroll-to-chevron';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import transparency from '../(assets)/transparency.svg';

export async function Resources({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-selection'],
	});

	return (
		<BaseContainer
			id="resources-section"
			className="bg-background relative flex h-[calc(100svh)] items-center justify-center"
		>
			<div className="text-center">
				<div className="mb-2">
					<Typography size="xl" className="mb-8">
						{translator.t('section-2.subtitle')}
					</Typography>
				</div>
				<div className="mx-auto mb-20 max-w-2xl">
					{translator.t<{ text: string; color?: FontColor }[]>('section-2.title').map((title, index) => (
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
				<div className="mt-20 flex flex-col items-center justify-center md:flex-row">
					<div className="mb-4 mr-3 mt-1 flex-shrink-0 md:mb-0">
						<Image className="h-16 w-16" src={transparency} alt="Globe" />
					</div>

					<div className="text-center md:text-left">
						<div className="mx-auto max-w-4xl">
							<Typography as="span" color="accent" className="block text-xl">
								{translator.t('section-2.amount')} {translator.t('section-2.amount-context')}
							</Typography>
							<div className="flex items-center justify-center space-x-1 md:justify-start">
								<Typography as="span" className="text-xl">
									{translator.t('section-2.scope')}
								</Typography>
								<Button variant="link">
									<a href="../transparency/finances" target="_blank" rel="noopener noreferrer">
										<Typography as="span" className="text-xl">
											{translator.t('section-2.transparency-page')}
										</Typography>
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute bottom-[20px] left-0 right-0 text-center">
					<Typography size="xl" className="mb-1">
						{translator.t('section-2.continue-1')}
					</Typography>
					<Typography size="xl" className="mb-2">
						{translator.t('section-2.continue-2')}
					</Typography>
					<div className="flex justify-center">
						<ScrollToChevron elementId="selection-process-section" />
					</div>
				</div>
			</div>
		</BaseContainer>
	);
}
