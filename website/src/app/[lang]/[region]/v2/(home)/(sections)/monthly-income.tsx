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
		<BaseContainer backgroundColor="bg-foreground-dark" className="py-3">
			<div className="my-4 py-12 text-center text-white">
				<Typography size="lg" className="opacity-40">
					{translator.t('section-3.title-faded')}
				</Typography>
				<Typography size="3xl" className="py-8">
					{translator.t('section-3.title')}
				</Typography>
				<IncomeInput />
				<Typography className="pb-2 pt-8 opacity-40">{translator.t('section-3.subtitle')}</Typography>
			</div>
		</BaseContainer>
	);
}
