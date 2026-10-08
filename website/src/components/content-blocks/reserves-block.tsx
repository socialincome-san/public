import { CurrencySwitch } from '@/components/currency/currency-switch';
import { ReservesTotal } from '@/components/reserves/reserves-total';
import type { ReservesBlock as ReservesBlockBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { mapWebsiteCurrencies, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getLatestReservesAction } from '@/modules/reserves/reserve.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

const FINANCIAL_INSTITUTIONS = [
	{ id: 'postfinance', labelKey: 'transparency-page.reserves.institutions.postfinance' },
	{ id: 'ecobank', labelKey: 'transparency-page.reserves.institutions.ecobank' },
	{ id: 'orange-money', labelKey: 'transparency-page.reserves.institutions.orange-money' },
] as const;

type Props = {
	blok: ReservesBlockBlok;
	lang: WebsiteLanguage;
};

export const ReservesBlock = async ({ blok, lang }: Props) => {
	const [t, reservesResult] = await Promise.all([getTranslations('website-common'), getLatestReservesAction()]);

	if (!reservesResult.success) {
		return null;
	}

	const displayResult = await resolveChfAmountsAction({ amounts: [reservesResult.data.total] });
	if (!displayResult.success) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			<CurrencySwitch
				variants={mapWebsiteCurrencies((displayCurrency) => {
					const reserves = displayResult.data[displayCurrency][0];

					return (
						reserves && (
							<ReservesTotal
								amount={reserves.amount}
								title={t('transparency-page.reserves.total-today')}
								titleCurrency={t('transparency-page.reserves.title-currency', { currency: reserves.currency })}
								institutionsHeading={t('transparency-page.reserves.institutions-heading')}
								institutions={FINANCIAL_INSTITUTIONS.map(({ id, labelKey }) => ({
									id,
									label: t(labelKey),
								}))}
								lang={lang}
							/>
						)
					);
				})}
			/>
		</BlockWrapper>
	);
};
