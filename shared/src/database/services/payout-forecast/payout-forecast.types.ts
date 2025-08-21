export type PayoutForecastTableViewRow = {
	period: string;
	numberOfRecipients: number;
	amountInProgramCurrency: number;
	amountUsd: number;
};

export type PayoutForecastTableView = {
	tableRows: PayoutForecastTableViewRow[];
};
