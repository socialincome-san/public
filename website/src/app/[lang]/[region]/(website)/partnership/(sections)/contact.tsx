import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';

export async function Contact({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partnership'],
	});

	return (
		<div className="mx-auto mb-8 mt-20 flex w-4/5 flex-col items-center justify-center md:mb-20 lg:w-3/5">
			<Typography size="3xl" weight="medium" className="mb-12 text-center">
				{translator.t('contact.title')}
			</Typography>
			<Typography size="lg" className="mb-12 text-center">
				{translator.t('contact.subtitle')}
			</Typography>
		</div>
	);
}