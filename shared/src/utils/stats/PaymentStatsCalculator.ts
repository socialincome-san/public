import _ from 'lodash';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Payment, PAYMENT_FIRESTORE_PATH } from '../../types';
import { toDateTime } from '../date';
import { getLatestExchangeRate } from '../exchangeRates';
import { cumulativeSum, groupByAndSort, StatsEntry } from './utils';

export interface PaymentStats {
	totalPayments: number;
	totalPaymentsByMonth: StatsEntry[];
	socialIncomesByMonth: StatsEntry[];
	cumulativePaymentsByMonth: StatsEntry[];
	cumulativeRecipientsByMonth: StatsEntry[];
	meanPaymentsByMonth: StatsEntry[];
}

/**
 * Simplified version of Payment, for easy computation of several contribution related stats
 */
type PaymentStatsEntry = {
	recipientId: string;
	amount: number;
	amountSle: number;
	month: string;
};

/**
 * Allows to compute several stats regarding payments
 * Data is once retrieved from firestore when calling the build function and is then reused to compute the
 * several stats.
 */
export class PaymentStatsCalculator {
	readonly payments: _.Collection<PaymentStatsEntry>;

	constructor(payments: _.Collection<PaymentStatsEntry>) {
		this.payments = payments;
	}

	/**
	 * Calls the firestore database to retrieve the payments and constructs the
	 * PaymentStatsCalculator with the flattened intermediate data structure.
	 */
	static async build(firestoreAdmin: FirestoreAdmin, currency: string): Promise<PaymentStatsCalculator> {
		const payments = await firestoreAdmin.collectionGroup<Payment>(PAYMENT_FIRESTORE_PATH).get();
		const exchangeRate = await getLatestExchangeRate(firestoreAdmin, currency);
		const contributions = payments.docs
			.filter((payment) => payment.data().amount_chf != undefined)
			.map((paymentDoc) => {
				const payment = paymentDoc.data();
				return {
					recipientId: paymentDoc.ref.parent?.parent?.id,
					amount: payment.amount_chf! * exchangeRate,
					amountSle: payment.currency === 'SLE' ? payment.amount : payment.amount / 1000,
					month: toDateTime(payment.payment_at).toFormat('yyyy-MM'),
				} as PaymentStatsEntry;
			});
		return new PaymentStatsCalculator(_(contributions));
	}

	totalPayments = () => {
		return this.payments.sumBy((c) => c.amount);
	};

	totalPaymentsByMonth = () => {
		return this.totalPaymentsBy('month');
	};

	cumulativePaymentsByMonth = () => {
		return cumulativeSum(cumulativeSum(this.totalPaymentsBy('month'), 'payment'), 'paymentSle');
	};

	meanPaymentsByMonth = () => {
		return this.meanPaymentsBy('month');
	};

	socialIncomesByMonth = () => {
		return this.countSocialIncomesBy('month');
	};

	totalPaymentsBy = (attribute: string) => {
		return this.groupByAndSortPayments(attribute, _.sumBy);
	};

	meanPaymentsBy = (attribute: string) => {
		return this.groupByAndSortPayments(attribute, _.meanBy);
	};

	countSocialIncomesBy = (attribute: string) => {
		return groupByAndSort(this.payments, attribute, (group) => group.length, 'payment');
	};

	groupByAndSortPayments = (
		groupAttribute: string,
		aggregate: <T>(collection: T[], iteratee?: ((value: T) => number) | string) => number,
	) => {
		return this.payments
			.groupBy(groupAttribute)
			.map((contributions, group) => ({
				[groupAttribute]: group,
				payment: aggregate(contributions, 'amount'),
				paymentSle: aggregate(contributions, 'amountSle'),
			}))
			.sortBy((x) => x[groupAttribute])
			.value();
	};

	cumulativeRecipientsByMonth = () => {
		interface CumulativeRecipients {
			month: string;
			recipientIds: Set<string>;
		}
		const recipientIdsByMonth = this.payments
			.groupBy('month')
			.map((payments, group) => ({
				month: group,
				recipientIds: new Set(payments.map((p) => p.recipientId)),
			}))
			.sortBy((x) => x.month)
			.value();

		const cumulativeRecipientsIdsByMonth = _.reduce(
			recipientIdsByMonth,
			(acc, element) => {
				const previousRecipients = acc.length > 0 ? acc[acc.length - 1].recipientIds : new Set<string>();
				acc.push({
					month: element.month,
					recipientIds: new Set([...previousRecipients, ...element.recipientIds]),
				});
				return acc;
			},
			[] as CumulativeRecipients[],
		);
		return cumulativeRecipientsIdsByMonth.map((element) => {
			return {
				month: element.month,
				recipients: element.recipientIds.size,
			};
		});
	};

	allStats = (): PaymentStats => {
		return {
			totalPayments: this.totalPayments(),
			totalPaymentsByMonth: this.totalPaymentsByMonth(),
			cumulativePaymentsByMonth: this.cumulativePaymentsByMonth(),
			cumulativeRecipientsByMonth: this.cumulativeRecipientsByMonth(),
			meanPaymentsByMonth: this.meanPaymentsByMonth(),
			socialIncomesByMonth: this.socialIncomesByMonth(),
		} as PaymentStats;
	};
}
