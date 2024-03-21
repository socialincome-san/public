import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';

export async function MonthlyIncome ({lang, region}: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
		<BaseContainer>
			<div>
				Monthly Income section
			</div>
		</BaseContainer>
	)
}