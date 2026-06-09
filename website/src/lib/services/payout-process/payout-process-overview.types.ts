import type { PayoutProcess } from '@/generated/prisma/enums';

export type MobileMoneyProviderPayoutProcessOption = {
	kind: 'mobile_money_provider';
	id: string;
	name: string;
	payoutProcess: PayoutProcess;
};

export type TelecelCsvPayoutProcessOption = {
	kind: 'telecel_csv';
	id: 'telecel_csv';
	name: string;
	payoutProcess: 'telecel_csv';
	providerNames: string[];
};

export type PayoutProcessOverviewOption = MobileMoneyProviderPayoutProcessOption | TelecelCsvPayoutProcessOption;
