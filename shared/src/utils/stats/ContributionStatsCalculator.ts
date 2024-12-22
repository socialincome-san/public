import _ from 'lodash';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH, StatusKey } from '../../types/contribution';
import { CountryCode } from '../../types/country';
import { Currency } from '../../types/currency';
import { User, USER_FIRESTORE_PATH } from '../../types/user';
import { getLatestExchangeRate } from '../exchangeRates';
import { cumulativeSum, StatsEntry } from './utils';

export interface ContributionStats {
	totalContributionsAmount: number;
	totalContributionsCount: number;
	totalContributorsCount: number;
	totalIndividualContributionsAmount: number;
	totalIndividualContributorsCount: number;
	totalInstitutionalContributionsAmount: number;
	totalInstitutionalContributorsCount: number;
	totalContributionsByCurrency: Record<string, string | number>[];
	totalContributionsByIsInstitution: StatsEntry[];
	totalContributionsByCountry: StatsEntry[];
	totalContributionsBySource: StatsEntry[];
	totalContributionsByMonth: StatsEntry[];
	totalContributionsByMonthAndType: StatsEntry[];
	totalPaymentFeesByIsInstitution: StatsEntry[];
}

/**
 * Simplified version of Contribution, for easy computation of several contribution related stats
 */
type ContributionStatsEntry = {
	userId: string;
	isInstitution: boolean;
	country: CountryCode;
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

	private constructor(contributions: _.Collection<ContributionStatsEntry>) {
		this.contributions = contributions;
	}

	/**
	 * Calls the firestore database to retrieve the contributions per user and constructs the
	 * ContributionStatsCalculator with the flattened intermediate data structure.
	 * @param firestoreAdmin
	 * @param currency
	 * @param contributionFilter
	 */
	static async build(
		firestoreAdmin: FirestoreAdmin,
		currency: Currency,
		contributionFilter = (c: Contribution) => c.status === StatusKey.SUCCEEDED,
	): Promise<ContributionStatsCalculator> {
		const exchangeRate = await getLatestExchangeRate(firestoreAdmin, currency);

		const getContributionsForUser = async (userId: string): Promise<Contribution[]> => {
			return await firestoreAdmin.getAll<Contribution>(
				`${USER_FIRESTORE_PATH}/${userId}/${CONTRIBUTION_FIRESTORE_PATH}`,
			);
		};

		const users = await firestoreAdmin.collection<User>(USER_FIRESTORE_PATH).get();
		const contributions = await Promise.all(
			users.docs
				.filter((userDoc) => !userDoc.get('test_user'))
				.map(async (userDoc) => {
					const user = userDoc.data();
					const contributions = await getContributionsForUser(userDoc.id);
					return contributions.filter(contributionFilter).map((contribution) => {
						const created = contribution.created.toDate();
						if (created.getFullYear() < 2020) {
							console.log(userDoc.id, created);
						}
						return {
							userId: userDoc.id,
							isInstitution: Boolean(user.institution),
							country: user.address.country ?? 'CH',
							amount: contribution.amount_chf * exchangeRate,
							paymentFees: contribution.fees_chf * exchangeRate,
							source: contribution.source,
							currency: contribution.currency.toUpperCase() ?? '',
							month: DateTime.fromObject({
								year: created.getFullYear(),
								month: created.getMonth() + 1, // month is indexed from 0 in JS
							}).toFormat('yyyy-MM'),
						} as ContributionStatsEntry;
					});
				}),
		);
		return new ContributionStatsCalculator(_(contributions.flat()));
	}

	totalContributionsAmount = () => {
		return this.contributions.sumBy('amount');
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
				amount: _.sumBy(contributions, 'amount'),
				usersCount: _.size(_.countBy(contributions, 'userId')),
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
					(c) => c.amount,
				),
				individual: _.sumBy(
					contributions.filter((x) => !x.isInstitution),
					(c) => c.amount,
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

	allStats = (): ContributionStats => {
		const totalContributionsByIsInstitution = this.totalContributionsByIsInstitution();
		const totalIndividualContributions = totalContributionsByIsInstitution.find((e) => e.isInstitution === 'false');
		const totalInstitutionalContributions = totalContributionsByIsInstitution.find((e) => e.isInstitution === 'true');

		return {
			totalContributionsAmount: this.totalContributionsAmount(),
			totalContributionsCount: this.contributions.size(),
			totalContributorsCount: this.contributions.groupBy('userId').size(),
			totalIndividualContributionsAmount: totalIndividualContributions?.amount || 0,
			totalIndividualContributorsCount: totalIndividualContributions?.usersCount || 0,
			totalInstitutionalContributionsAmount: totalInstitutionalContributions?.amount || 0,
			totalInstitutionalContributorsCount: totalInstitutionalContributions?.usersCount || 0,
			totalContributionsByCurrency: this.totalContributionsByCurrency(),
			totalContributionsByIsInstitution: totalContributionsByIsInstitution,
			totalContributionsByCountry: this.totalContributionsByCountry(),
			totalContributionsBySource: this.totalContributionsBySource(),
			totalContributionsByMonth: this.totalContributionsByMonth(),
			totalContributionsByMonthAndType: this.totalContributionsByMonthAndType(),
			totalPaymentFeesByIsInstitution: this.totalPaymentFeesByInstitution(),
		};
	};
}
