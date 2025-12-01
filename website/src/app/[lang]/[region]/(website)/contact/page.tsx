import { DefaultPageProps } from '@/app/[lang]/[region]';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-contact'],
	});

	return (
		<BaseContainer className="flex flex-col space-y-8">
			<Typography size="3xl" weight="bold">
				{translator.t('title')}
			</Typography>

			<div className="flex flex-col space-y-2">
				<Typography size="xl" weight="bold">
					{translator.t('contactEmailTitle')}
				</Typography>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground" className="pr-1">
						{translator.t('emailGeneralTitle')}
					</Typography>
					<Typography as="a" href={`mailto:${translator.t('emailGeneral')}`} size="xl" className="underline">
						{translator.t('emailGeneral')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground" className="pr-1">
						{translator.t('emailContributorsTitle')}
					</Typography>
					<Typography as="a" href={`mailto:${translator.t('emailContributors')}`} size="xl" className="underline">
						{translator.t('emailContributors')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground" className="pr-1">
						{translator.t('emailLegalTitle')}
					</Typography>
					<Typography as="a" href={`mailto:${translator.t('emailLegal')}`} size="xl" className="underline">
						{translator.t('emailLegal')}
					</Typography>
				</div>
			</div>
			<div className="flex flex-col space-y-2">
				<Typography size="xl" weight="bold">
					{translator.t('contactAddressTitle')}
				</Typography>
				<div>
					<Typography as="span" size="xl" color="muted-foreground">
						{translator.t('orgName')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl">
						{translator.t('addressStreet')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl" color="muted-foreground">
						{translator.t('addressZipCode') + ' ' + translator.t('addressCity')}
					</Typography>
				</div>
				<div>
					<Typography as="span" size="xl">
						{translator.t('addressCountry')}
					</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
