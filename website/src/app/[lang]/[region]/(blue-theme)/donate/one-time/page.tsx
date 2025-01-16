import { DefaultPageProps } from '@/app/[lang]/[region]';
import GenericDonationForm from '@/app/[lang]/[region]/(blue-theme)/donate/one-time/generic-donation-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export enum DonationInterval {
	OneTime = 'one-time',
	Monthly = 'monthly',
}

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-donate' });
	return (
		<BaseContainer className="mx-auto flex max-w-3xl flex-col pt-8 md:pt-16">
			<div className="flex flex-col items-center">
				<Typography size="5xl" weight="bold" color="accent">
					{translator.t('one-time.title')}
				</Typography>
				<Typography size="3xl" weight="medium" className="mt-4">
					{translator.t('one-time.subtitle')}
				</Typography>
				<div className="text-popover-foreground mt-16 w-full">
					<GenericDonationForm
						defaultInterval={DonationInterval.OneTime}
						lang={lang}
						region={region}
						translations={{
							oneTime: translator.t('donation-interval.0.title'),
							monthly: translator.t('donation-interval.1.title'),
							amount: translator.t('amount'),
							submit: translator.t('button-text-short'),
						}}
					/>
				</div>
			</div>
		</BaseContainer>
	);
}
