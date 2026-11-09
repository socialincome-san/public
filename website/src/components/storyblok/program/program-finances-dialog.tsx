'use client';

import { ProgramDetailDialog } from '@/components/storyblok/program/program-detail-dialog';
import { ProgramPayoutForecastTable } from '@/components/storyblok/program/program-payout-forecast-table';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPublicPayoutForecastTableAction } from '@/modules/payouts/payout.actions';
import type { PayoutForecastTableViewRow } from '@/modules/payouts/payout.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { type ReactNode, useEffect, useState } from 'react';

type Props = {
	dialogTitle: string;
	viewBreakdownLabel: string;
	manageLabel: ReactNode;
	manageHref: string;
	payoutForecastInfoTooltip: string;
	financesCard: ReactNode;
	programId: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const ProgramFinancesDialog = ({
	dialogTitle,
	viewBreakdownLabel,
	manageLabel,
	manageHref,
	payoutForecastInfoTooltip,
	financesCard,
	programId,
	lang,
	currency,
}: Props) => {
	const t = useTranslations('website-common');
	const [isOpen, setIsOpen] = useState(false);
	const [forecast, setForecast] = useState<{
		programId: string;
		currency: WebsiteCurrency;
		rows: PayoutForecastTableViewRow[];
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		if (!isOpen || (forecast?.programId === programId && forecast.currency === currency)) {
			return;
		}

		let isCancelled = false;

		const loadForecast = async () => {
			setIsLoading(true);
			setHasError(false);

			const result = await getPublicPayoutForecastTableAction(programId, currency);

			if (isCancelled) {
				setIsLoading(false);

				return;
			}

			setIsLoading(false);

			if (!result.success) {
				setHasError(true);

				return;
			}

			setForecast({ programId, currency, rows: result.data.tableRows });
		};

		void loadForecast();

		return () => {
			isCancelled = true;
		};
	}, [currency, forecast?.currency, forecast?.programId, isOpen, programId, retryKey]);

	return (
		<ProgramDetailDialog
			title={dialogTitle}
			triggerLabel={viewBreakdownLabel}
			closeAriaLabel={t('program-detail-page.close')}
			onOpenChange={setIsOpen}
			headerActions={
				<Button asChild size="sm" variant="outline">
					<Link href={manageHref}>{manageLabel}</Link>
				</Button>
			}
		>
			{financesCard}
			{isLoading ? (
				<p className="text-muted-foreground text-sm" role="status" aria-live="polite">
					{t('program-detail-page.loading')}
				</p>
			) : hasError ? (
				<div className="text-destructive border-destructive/20 bg-destructive-foreground flex flex-col gap-4 rounded-md border p-4">
					<p className="font-medium">{t('program-detail-page.load-payout-forecast-error')}</p>
					<div>
						<Button
							type="button"
							variant="destructive-outline"
							onClick={() => {
								setHasError(false);
								setRetryKey((current) => current + 1);
							}}
						>
							{t('program-detail-page.try-again')}
						</Button>
					</div>
				</div>
			) : forecast?.programId === programId && forecast.currency === currency ? (
				<ProgramPayoutForecastTable
					rows={forecast.rows}
					titleInfoTooltip={payoutForecastInfoTooltip}
					lang={lang}
					displayCurrency={currency}
				/>
			) : null}
		</ProgramDetailDialog>
	);
};
