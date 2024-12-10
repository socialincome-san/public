import { DefaultParams } from '@/app/[lang]/[region]';
import ScrollToChevron from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/(components)/scroll-to-chevron';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Button, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import transparency from '../(assets)/transparency.svg';

export async function Resources({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-selection'],
	});

	return (
		<div id="resources-section" className="flex h-[calc(100svh)] min-h-[600px] flex-col">
			<div className="mt-[80px] flex flex-grow flex-col items-center justify-center p-6 text-center">
				<div className="pb-4">
					<Typography size="xl">{translator.t('section-2.subtitle')}</Typography>
				</div>
				<div className="max-w-3xl">
					{translator.t<{ text: string; color?: FontColor }[]>('section-2.title').map((title, index) => (
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
					<Image className="h-12 w-12 md:h-20 md:w-20" src={transparency} alt="Transparency Icon" />
					<div className="mx-auto my-4 max-w-4xl text-center sm:text-left">
						<div>
							<Button variant="link">
								<a href="../transparency/finances" target="_blank" rel="noopener noreferrer">
									<Typography as="span" className="text-xl sm:text-2xl">
										{translator.t('section-2.amount')} {translator.t('section-2.amount-context')}
									</Typography>
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center py-4 text-center">
				<Typography size="xl">{translator.t('section-2.continue-1')}</Typography>
				<div className="flex justify-center">
					<ScrollToChevron elementId="selection-process-section" />
				</div>
			</div>
		</div>
	);
}
