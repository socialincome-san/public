import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import ScrollToChevron from '../(components)/scroll-to-chevron';

type ResourcePageProps = {
	currency: string;
} & DefaultParams;

const roundAmount = (amount: number) => (amount ? Math.round(amount / 10) * 10 : 0);

export async function Resources({ lang, currency }: ResourcePageProps) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
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

			<div className="flex flex-col items-center py-4 text-center">
				<Typography size="xl">{translator.t('section-2.continue-1')}</Typography>
				<div className="flex justify-center">
					<ScrollToChevron elementId="selection-process-section" />
				</div>
			</div>
		</div>
	);
}
