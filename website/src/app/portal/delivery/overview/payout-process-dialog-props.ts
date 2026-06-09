export type PayoutProcessDialogBaseProps = {
	selectedDate: Date;
	selectedMonthLabel: string;
	open: boolean;
	onClose: () => void;
};

export type OrangeMoneyCsvPayoutProcessDialogProps = PayoutProcessDialogBaseProps & {
	mobileMoneyProviderId: string;
	providerName: string;
};

export type TelecelCsvPayoutProcessDialogProps = PayoutProcessDialogBaseProps;
