export type PayoutForecastTableViewRow = {
	/** Example: "November 2025" */
	period: string;

	/** Number of active recipients expected to receive payouts in this period */
	numberOfRecipients: number;

	/** Total payout sum in the program’s currency */
	amountInProgramCurrency: number;

	/** Converted payout sum in USD using latest exchange rate */
	amountUsd: number;
};

export type PayoutForecastTableViewProgramScoped = {
	/** The forecast rows for each upcoming month */
	tableRows: PayoutForecastTableViewRow[];
};
