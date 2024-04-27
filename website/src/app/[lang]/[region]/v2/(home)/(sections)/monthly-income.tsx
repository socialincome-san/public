import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { IncomeInput } from '../(components)/income-input';

export async function MonthlyIncome({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home2', 'common'],
	});

	return (
		<BaseContainer backgroundColor="bg-primary">
			<div className="bg-primary my-4 py-12 text-center text-white">
				<Typography className="opacity-40">{translator.t('section-3.title-faded')}</Typography>
				<Typography size="2xl" className="py-4">
					{translator.t('section-3.title')}
				</Typography>
				<IncomeInput />
				<Typography className="pb-2 pt-6 opacity-40">{translator.t('section-3.subtitle')}</Typography>
			</div>
		</BaseContainer>
	);
}
