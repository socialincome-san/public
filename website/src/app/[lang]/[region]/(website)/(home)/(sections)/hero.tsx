import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import HeroForm from './hero-form';

export async function Hero({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer className="min-h-screen-navbar grid grid-cols-1 content-center items-start gap-x-4 gap-y-8 align-top sm:gap-y-16 lg:grid-cols-2 lg:gap-y-0">
			<div className="mx-auto w-full max-w-2xl">
				<Typography size="5xl" weight="bold">
					{translator.t('section-1.title-1')}
					<Typography as="span" size="5xl" weight="bold" color="secondary">
						{translator.t('section-1.title-2')}
					</Typography>
					{translator.t('section-1.title-3')}
				</Typography>
			</div>
			<div className="mx-auto w-full max-w-2xl">
				<HeroForm
					lang={lang}
					region={region}
					translations={{
						text: translator.t('section-1.income-text'),
						currency: translator.t('currency'),
						amount: translator.t('section-1.amount'),
						submit: translator.t('section-1.button-text'),
						privacyCommitment: translator.t('section-1.privacy-commitment'),
						taxDeductible: translator.t('section-1.tax-deductible'),
						oneTimeDonation: translator.t('section-1.one-time-donation'),
					}}
				/>
			</div>
		</BaseContainer>
	);
}
