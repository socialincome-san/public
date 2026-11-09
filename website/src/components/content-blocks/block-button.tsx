import { buildCampaignSubmissionLabels } from '@/components/campaign/build-campaign-submission-labels';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import { CreateProgramButton } from '@/components/create-program-wizard/create-program-button';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import type { Button as ButtonBlok, LandingHero } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';

type Props = {
	button: ButtonBlok | undefined;
	action: LandingHero['buttonAction'];
	variant: 'default' | 'outline';
	fullWidth?: boolean;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const hasBlockButton = (
	button: ButtonBlok | undefined,
	action: LandingHero['buttonAction'],
	lang: WebsiteLanguage,
	currency: WebsiteCurrency,
) => {
	if (!button?.label?.trim()) {
		return false;
	}

	return action ? true : resolveStoryblokLink(button.link, lang, currency) !== '#';
};

export const BlockButton = async ({ button, action, variant, fullWidth, lang, currency }: Props) => {
	const label = button?.label?.trim();
	if (!label || !hasBlockButton(button, action, lang, currency)) {
		return null;
	}

	switch (action) {
		case 'donate':
			return <OpenDonationWizardButton label={label} variant={variant} fullWidth={fullWidth} />;
		case 'createProgram':
			return <CreateProgramButton label={label} variant={variant} fullWidth={fullWidth} />;
		case 'createCampaign': {
			const t = await getTranslations('website-common');

			return (
				<CreateCampaignButton
					label={label}
					labels={buildCampaignSubmissionLabels(t)}
					lang={lang}
					currency={currency}
					variant={variant}
					fullWidth={fullWidth}
				/>
			);
		}
		default:
			return (
				<Button variant={variant} fullWidth={fullWidth} asChild>
					<NextLink href={resolveStoryblokLink(button?.link, lang, currency)}>{label}</NextLink>
				</Button>
			);
	}
};
