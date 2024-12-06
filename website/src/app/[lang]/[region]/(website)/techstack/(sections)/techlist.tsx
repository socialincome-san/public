import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';

export async function TechList({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-techstack'],
	});

	return (
		<div>
				<Typography color="accent" className="text-center">
					 {translator.t('cards.title-1')}
				</Typography>
		</div>
	);
}