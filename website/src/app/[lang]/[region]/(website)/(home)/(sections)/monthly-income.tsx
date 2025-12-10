import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';
import { IncomeInput } from '../(components)/income-input';

export async function MonthlyIncome({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer className="theme-blue my-4 py-20 text-center">
			<Typography size="lg" className="opacity-40">
				{translator.t('section-3.title-faded')}
			</Typography>
			<Typography size="3xl" className="py-8">
				{translator.t('section-3.title')}
			</Typography>
			<IncomeInput translations={{ buttonText: translator.t('section-3.cta') }} />
		</BaseContainer>
	);
}
