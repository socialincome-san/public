import { BlockWrapper } from '@/components/block-wrapper';
import { OutflowsSection } from '@/components/outflows/outflows-section';
import {
	buildOutflowsSectionRows,
	OUTFLOW_AUDIT_FIRM,
	OUTFLOW_NGO_AVERAGE_SOURCE_URL,
	OUTFLOW_NGO_UPPER_LIMIT_PERCENT,
	OUTFLOW_REACH_PERCENT,
} from '@/components/outflows/outflows-spend';

import type { Outflows as OutflowsBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: OutflowsBlok;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const OutflowsBlock = async ({ blok, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const downloadsHref = getWebsitePublicPath(lang, region, 'downloads');

	const rows = buildOutflowsSectionRows({
		'direct-cash': {
			label: translator.t('transparency-page.outflows.segments.direct-cash.label'),
			description: translator.t('transparency-page.outflows.segments.direct-cash.description'),
		},
		administration: {
			label: translator.t('transparency-page.outflows.segments.administration.label'),
			description: translator.t('transparency-page.outflows.segments.administration.description'),
		},
		fundraising: {
			label: translator.t('transparency-page.outflows.segments.fundraising.label'),
			description: translator.t('transparency-page.outflows.segments.fundraising.description'),
		},
	});

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<OutflowsSection
				downloadsHref={downloadsHref}
				ngoAverageSourceUrl={OUTFLOW_NGO_AVERAGE_SOURCE_URL}
				rows={rows}
				copy={{
					eyebrow: translator.t('transparency-page.outflows.eyebrow'),
					headlineBeforeBold: translator.t('transparency-page.outflows.headline-before'),
					headlineBold: translator.t('transparency-page.outflows.headline-bold', {
						context: { percent: OUTFLOW_REACH_PERCENT },
					}),
					headlineAfterBold: translator.t('transparency-page.outflows.headline-after'),
					zewoBefore: translator.t('transparency-page.outflows.zewo-before', {
						context: { auditFirm: OUTFLOW_AUDIT_FIRM },
					}),
					zewoLink: translator.t('transparency-page.outflows.zewo-link'),
					zewoAfter: translator.t('transparency-page.outflows.zewo-after'),
					zewoAlt: translator.t('transparency-page.outflows.zewo-alt'),
					breakdownTitle: translator.t('transparency-page.outflows.breakdown-title'),
					breakdownAriaLabel: translator.t('transparency-page.outflows.breakdown-aria-label'),
					ngoAverageBefore: translator.t('transparency-page.outflows.ngo-average-before'),
					ngoAverageSource: translator.t('transparency-page.outflows.ngo-average-source'),
					ngoAverageAfter: translator.t('transparency-page.outflows.ngo-average-after', {
						context: { amount: OUTFLOW_NGO_UPPER_LIMIT_PERCENT },
					}),
					donateNow: translator.t('countries-page.donate-now'),
					annualStatementBefore: translator.t('transparency-page.outflows.annual-statement-before'),
					annualStatementLink: translator.t('transparency-page.outflows.annual-statement-link'),
				}}
			/>
		</BlockWrapper>
	);
};
