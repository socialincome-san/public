import { Payout as PrismaPayout, PayoutStatus } from '@prisma/client';
import { recipientsData } from './recipients';

const makePayout = (
	i: number,
	recipientId: string,
	monthsAgo: number
): PrismaPayout => {
	const date = new Date();
	date.setUTCMonth(date.getUTCMonth() - monthsAgo);

	return {
		id: `payout-${i}-${monthsAgo}`,
		recipientId,
		amount: 700,
		amountChf: null,
		currency: 'SLE',
		paymentAt: date,
		status: PayoutStatus.paid,
		phoneNumber: null,
		comments: null,
		message: null,
		createdAt: new Date(),
		updatedAt: null,
	};
};

export const payoutsData: PrismaPayout[] = [];
for (let i = 0; i < recipientsData.length; i++) {
	const recipient = recipientsData[i];
	const paymentsCount = (i % 36) + 1;

	for (let m = 0; m < paymentsCount; m++) {
		payoutsData.push(makePayout(i + 1, recipient.id, paymentsCount - m));
	}
}