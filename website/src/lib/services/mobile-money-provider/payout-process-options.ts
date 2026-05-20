import { PayoutProcess } from '@/generated/prisma/enums';

export const PAYOUT_PROCESS_OPTIONS = [{ id: PayoutProcess.orange_money_csv, label: 'Orange Money CSV upload' }] as const;

const PAYOUT_PROCESS_VALUES = Object.values(PayoutProcess);

export const formatPayoutProcessLabel = (process: string | null | undefined): string | null => {
	if (!process) {
		return null;
	}

	return PAYOUT_PROCESS_OPTIONS.find((option) => option.id === process)?.label ?? process;
};

export const toPayoutProcess = (value: string): PayoutProcess | null => {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	return PAYOUT_PROCESS_VALUES.includes(trimmed as PayoutProcess) ? (trimmed as PayoutProcess) : null;
};
