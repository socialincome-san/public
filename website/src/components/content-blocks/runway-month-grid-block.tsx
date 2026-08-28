import { BlockWrapper } from '@/components/block-wrapper';
import type { RunwayMonthGrid as RunwayMonthGridBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { isRunwayInLineWithZewo } from '@/lib/services/transparency/transparency.types';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { RunwayMonthGrid } from '../runway-month-grid/runway-month-grid';

type Props = {
	blok: RunwayMonthGridBlok;
	lang: WebsiteLanguage;
};

export const RunwayMonthGridBlock = async ({ blok, lang }: Props) => {
	const language = lang === 'kri' ? 'en' : lang;
	const [translator, runwayResult] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
		services.transparency.getRunwayMonths(),
	]);
	if (!runwayResult.success) {
		return null;
	}

	const amountOfMonths = runwayResult.data;

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="space-y-6">
				<div className="space-y-2">
					{blok.title && <h2 className="text-primary text-xl font-semibold">{blok.title}</h2>}
					<p className="text-foreground">
						{translator.t('transparency-page.runway.description', { context: { count: amountOfMonths } })}
					</p>
				</div>
				<RunwayMonthGrid numberOfMonths={amountOfMonths} language={language} />
				{isRunwayInLineWithZewo(amountOfMonths) && (
					<div className="flex items-center gap-2 text-sm">
						<span className="relative flex size-2 shrink-0" aria-hidden>
							<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
							<span className="bg-confirm relative inline-flex size-2 rounded-full"></span>
						</span>
						<span>{translator.t('transparency-page.runway.zewo-hint')}</span>
					</div>
				)}
			</div>
		</BlockWrapper>
	);
};
