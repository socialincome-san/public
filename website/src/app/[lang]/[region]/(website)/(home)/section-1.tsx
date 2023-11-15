import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Section1Form from './section-1-form';

export async function Section1({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer
			backgroundColor="bg-blue-50"
			className="min-h-screen-navbar grid grid-cols-1 content-center items-center gap-y-8 lg:grid-cols-2"
		>
			<div className="mx-auto max-w-3xl">
				<Typography size="5xl" weight="bold">
					{translator.t('section-1.title-1')}
					<Typography as="span" size="5xl" weight="bold" color="secondary">
						{translator.t('section-1.title-2')}
					</Typography>
					{translator.t('section-1.title-3')}
				</Typography>
			</div>
			<div className="mx-auto max-w-2xl">
				<Section1Form
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
