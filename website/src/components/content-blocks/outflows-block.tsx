import { OutflowsSection } from '@/components/outflows/outflows-section';
import {
	buildOutflowsSectionRows,
	OUTFLOW_AUDIT_FIRM,
	OUTFLOW_NGO_AVERAGE_SOURCE_URL,
	OUTFLOW_NGO_UPPER_LIMIT_PERCENT,
	OUTFLOW_REACH_PERCENT,
} from '@/components/outflows/outflows-spend';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import type { Outflows as OutflowsBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: OutflowsBlok;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const OutflowsBlock = async ({ blok, lang, currency }: Props) => {
	const t = await getTranslations('website-common');
	const downloadsHref = getWebsitePublicPath(lang, currency, 'downloads');

	const rows = buildOutflowsSectionRows({
		'direct-cash': {
			label: t('transparency-page.outflows.segments.direct-cash.label'),
			description: t('transparency-page.outflows.segments.direct-cash.description'),
		},
		administration: {
			label: t('transparency-page.outflows.segments.administration.label'),
			description: t('transparency-page.outflows.segments.administration.description'),
		},
		fundraising: {
			label: t('transparency-page.outflows.segments.fundraising.label'),
			description: t('transparency-page.outflows.segments.fundraising.description'),
		},
	});

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<OutflowsSection
				downloadsHref={downloadsHref}
				ngoAverageSourceUrl={OUTFLOW_NGO_AVERAGE_SOURCE_URL}
				rows={rows}
				copy={{
					eyebrow: t('transparency-page.outflows.eyebrow'),
					headlineBeforeBold: t('transparency-page.outflows.headline-before'),
					headlineBold: t('transparency-page.outflows.headline-bold', { percent: OUTFLOW_REACH_PERCENT }),
					headlineAfterBold: t('transparency-page.outflows.headline-after'),
					zewoBefore: t('transparency-page.outflows.zewo-before', { auditFirm: OUTFLOW_AUDIT_FIRM }),
					zewoLink: t('transparency-page.outflows.zewo-link'),
					zewoAfter: t('transparency-page.outflows.zewo-after'),
					zewoAlt: t('transparency-page.outflows.zewo-alt'),
					breakdownTitle: t('transparency-page.outflows.breakdown-title'),
					breakdownAriaLabel: t('transparency-page.outflows.breakdown-aria-label'),
					ngoAverageBefore: t('transparency-page.outflows.ngo-average-before'),
					ngoAverageSource: t('transparency-page.outflows.ngo-average-source'),
					ngoAverageAfter: t('transparency-page.outflows.ngo-average-after', { amount: OUTFLOW_NGO_UPPER_LIMIT_PERCENT }),
					donateNow: t('countries-page.donate-now'),
					annualStatementBefore: t('transparency-page.outflows.annual-statement-before'),
					annualStatementLink: t('transparency-page.outflows.annual-statement-link'),
				}}
			/>
		</BlockWrapper>
	);
};
