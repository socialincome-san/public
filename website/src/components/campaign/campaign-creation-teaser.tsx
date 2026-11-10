'use client';

import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { CtaBanner } from '@socialincome/design-system/layout/cta-banner/cta-banner';
import type { SubmissionLabels } from './campaign-submission/types';
import { CreateCampaignDialog } from './create-campaign-dialog';

const backgroundImageSrc = '/assets/campaign/creation-teaser-background.png';

type Props = {
	translations: {
		title: string;
		description: string;
		button: string;
	};
	labels: SubmissionLabels;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CampaignCreationTeaser = ({ translations, labels, lang, currency }: Props) => (
	<BlockWrapper marginTop="none">
		<CreateCampaignDialog
			labels={labels}
			lang={lang}
			currency={currency}
			trigger={({ openDialog }) => (
				<CtaBanner
					title={translations.title}
					description={translations.description}
					image={{ src: backgroundImageSrc, alt: '' }}
					action={
						<Button type="button" variant="secondary" onClick={openDialog}>
							{translations.button}
						</Button>
					}
				/>
			)}
		/>
	</BlockWrapper>
);
