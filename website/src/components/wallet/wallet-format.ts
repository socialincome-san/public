export const formatWalletAmount = (amount: number): string => {
	if (amount === null || amount === undefined || Number.isNaN(amount)) {
		return '';
	}

	return new Intl.NumberFormat('de-CH', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};
