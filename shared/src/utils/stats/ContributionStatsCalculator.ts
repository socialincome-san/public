import { firestore } from 'firebase-admin';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../firebase/FirestoreAdmin';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH, StatusKey, User, USER_FIRESTORE_PATH } from '../../types';
import { getLatestExchangeRate } from '../exchangeRates';
import { cumulativeSum, StatsEntry } from './utils';
import Timestamp = firestore.Timestamp;

/**
 * Simplified version of Contribution, for easy computation of several contribution related stats
 */
type ContributionStatsEntry = {
	userId: string;
	isInstitution: boolean;
	country: string;
	amount: number;
	paymentFees: number;
	source: string;
	currency: string;
	month: string;
};

/**
 * Allows to compute several stats regarding contributions
 * Data is once retrieved from firestore when calling the build function and is then reused to compute the
 * several stats.
 */
export class ContributionStatsCalculator {
	readonly contributions: _.Collection<ContributionStatsEntry>;

	constructor(contributions: _.Collection<ContributionStatsEntry>) {
		this.contributions = contributions;
	}

	/**
	 * Calls the firestore database to retrieve the contributions per user and constructs the
	 * ContributionStatsCalculator with the flattened intermediate data structure.
	 * @param firestoreAdmin
	 * @param currency
	 */
	static async build(firestoreAdmin: FirestoreAdmin, currency: string): Promise<ContributionStatsCalculator> {
		const exchangeRate = await getLatestExchangeRate(firestoreAdmin, currency);

		const getContributionsForUser = async (userId: string): Promise<Contribution[]> => {
			return await firestoreAdmin.getAll<Contribution>(
				`${USER_FIRESTORE_PATH}/${userId}/${CONTRIBUTION_FIRESTORE_PATH}`
			);
		};

		const users = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).get();
		const contributions = await Promise.all(
			users.docs
				.filter((userDoc) => !userDoc.data().test_user)
				.map(async (userDoc) => {
					const user = userDoc.data();
					const contributions = await getContributionsForUser(userDoc.id);
					return contributions
						.filter(
							(contribution) =>
								contribution.status == StatusKey.SUCCEEDED ||
								contribution.status == StatusKey.UNKNOWN ||
								contribution.status == undefined
						)
						.map((contribution) => {
							const created = (contribution.created as Timestamp).toDate();
							return {
								userId: userDoc.id,
								isInstitution: user.institution ?? false,
								country: user.location?.toUpperCase() ?? 'CH',
								amount: contribution.amount_chf * exchangeRate,
								paymentFees: contribution.fees_chf * exchangeRate,
								source: contribution.source,
								currency: contribution.currency.toUpperCase() ?? '',
								month: DateTime.fromObject({
									year: created.getFullYear(),
									month: created.getMonth() + 1, // month is indexed from 0 in JS
									day: 1,
								}).toFormat('yyyy-MM-dd'),
							} as ContributionStatsEntry;
						});
				})
		);
		return new ContributionStatsCalculator(_(contributions.flat()));
	}

	totalContributions = () => {
		return this.contributions.sumBy((c) => c.amount);
	};

	totalContributionsByCurrency = () => {
		return this.totalContributionsBy('currency');
	};

	totalContributionsByIsInstitution = () => {
		return this.totalContributionsBy('isInstitution');
	};

	totalContributionsByCountry = () => {
		return this.totalContributionsBy('country');
	};

	totalContributionsBySource = () => {
		return this.totalContributionsBy('source');
	};

	totalContributionsByMonth = () => {
		return this.totalContributionsBy('month');
	};

	totalPaymentFeesByInstitution = () => {
		return this.totalPaymentFeesBy('isInstitution');
	};

	totalContributionsBy = (attribute: string) => {
		return this.contributions
			.groupBy(attribute)
			.map((contributions, group) => ({
				[attribute]: group,
				amount: _.sumBy(contributions, (c) => c.amount),
			}))
			.sortBy((x) => x[attribute])
			.value();
	};

	totalContributionsByMonthAndType = () => {
		const contributions = this.contributions
			.groupBy('month')
			.map((contributions, group) => ({
				month: group,
				institutional: _.sumBy(
					contributions.filter((x) => x.isInstitution),
					(c) => c.amount
				),
				individual: _.sumBy(
					contributions.filter((x) => !x.isInstitution),
					(c) => c.amount
				),
			}))
			.sortBy((x) => x['month'])
			.value();

		return cumulativeSum(cumulativeSum(contributions, 'institutional'), 'individual');
	};

	totalPaymentFeesBy = (attribute: string) => {
		return this.contributions
			.groupBy(attribute)
			.map((contributions, group) => ({
				[attribute]: group,
				amount: _.sumBy(contributions, (c) => c.paymentFees),
			}))
			.sortBy((x) => x[attribute])
			.value();
	};

	allStats = () => {
		return {
			totalContributions: this.totalContributions(),
			totalContributionsByCurrency: this.totalContributionsByCurrency(),
			totalContributionsByIsInstitution: this.totalContributionsByIsInstitution(),
			totalContributionsByCountry: this.totalContributionsByCountry(),
			totalContributionsBySource: this.totalContributionsBySource(),
			totalContributionsBymonth: this.totalContributionsByMonth(),
			totalContributionsByMonthAndType: this.totalContributionsByMonthAndType(),
			totalPaymentFeesByIsInstitution: this.totalPaymentFeesByInstitution(),
		};
	};
}

export interface ContributionStats {
	totalContributions: number;
	totalContributionsByCurrency: StatsEntry[];
	totalContributionsByIsInstitution: StatsEntry[];
	totalContributionsByCountry: StatsEntry[];
	totalContributionsBySource: StatsEntry[];
	totalContributionsBymonth: StatsEntry[];
	totalContributionsByMonthAndType: StatsEntry[];
	totalPaymentFeesByIsInstitution: StatsEntry[];
}
