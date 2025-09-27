import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function OrgsPartnershipTitle({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (
		<div className="mx-auto pt-10 flex w-4/5 flex-col items-center justify-center md:mb-20 lg:w-4/5">
			<Typography weight="medium" className="mb-12 text-center text-3xl sm:text-4xl md:text-4xl">
				{translator.t('partner-carousel.title')}
			</Typography>
			<Typography size="xl" className="mb-4 text-center leading-relaxed">
				{translator.t('partner-carousel.subtitle')}
			</Typography>
		</div>
	);
}
