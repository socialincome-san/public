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
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

/** A Storyblok button that follows its link or, depending on the action, opens a form on the page. */
export const BlockButton = async ({ button, action, variant, lang, currency }: Props) => {
	const label = button?.label?.trim();
	if (!label) {
		return null;
	}

	switch (action) {
		case 'donate':
			return <OpenDonationWizardButton label={label} variant={variant} />;
		case 'createProgram':
			return <CreateProgramButton label={label} variant={variant} />;
		case 'createCampaign': {
			const t = await getTranslations('website-common');

			return (
				<CreateCampaignButton
					label={label}
					labels={buildCampaignSubmissionLabels(t)}
					lang={lang}
					currency={currency}
					variant={variant}
				/>
			);
		}
		default: {
			const href = resolveStoryblokLink(button?.link, lang, currency);

			return href === '#' ? null : (
				<Button variant={variant} asChild>
					<NextLink href={href}>{label}</NextLink>
				</Button>
			);
		}
	}
};
