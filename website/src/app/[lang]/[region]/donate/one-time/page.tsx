import { DefaultPageProps } from '@/app/[lang]/[region]';
import OneTimeDonationForm from '@/app/[lang]/[region]/donate/one-time/one-time-donation-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import Link from 'next/link';

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
				<div className="mt-16 w-full">
					<OneTimeDonationForm
						lang={lang}
						region={region}
						translations={{
							amount: translator.t('amount'),
							submit: translator.t('button-text'),
						}}
					/>
				</div>
				{region === 'ch' && (
					<Link href="https://donate.raisenow.io/cvzzr" target="_blank">
						<Button size="lg" variant="link" className="mt-8">
							{translator.t('one-time.twint-button')}
						</Button>
					</Link>
				)}
			</div>
		</BaseContainer>
	);
}
