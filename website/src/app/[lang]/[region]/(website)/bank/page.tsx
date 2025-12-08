import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-bank-details'],
	});

	return (
		<BaseContainer className="items-left flex flex-col space-y-8 pt-16">
			<Typography size="3xl" weight="bold">
				{translator.t('section-1.bankIntroText') + ': '}
			</Typography>

			<div className="flex flex-col space-y-2">
				<Typography size="xl" weight="bold">
					{translator.t('section-1.bankInfoTextRecurring')}
				</Typography>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankPostFinance')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankAccountHolderPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankAccountHolder')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankIBANPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankIBAN1')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankBICPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankBIC')}
					</Typography>
				</div>
			</div>

			<div className="flex flex-col space-y-2">
				<Typography size="xl" weight="bold">
					{translator.t('section-1.bankOneTime')}
				</Typography>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankPostFinance')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankAccountHolderPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankAccountHolder')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankIBANPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankIBAN2')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankBICPrompt') + ': '}
					</Typography>
					<Typography as="span" size="xl">
						{translator.t('section-1.bankBIC')}
					</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
