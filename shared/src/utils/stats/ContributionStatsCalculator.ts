import { firestore } from 'firebase-admin';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../firebase/FirestoreAdmin';
import { Contribution, CONTRIBUTION_FIRESTORE_PATH, StatusKey, User, USER_FIRESTORE_PATH } from '../../types';
import Timestamp = firestore.Timestamp;

/**
 * Simplified version of Contribution, for easy computation of several contribution related stats
 */
type ContributionStatsEntry = {
	userId: string;
	isInstitution: boolean;
	country: string;
	amountChf: number;
	feesChf: number;
	source: string;
	currency: string;
	firstDayInMonth: string;
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
	 */
	static async build(firestoreAdmin: FirestoreAdmin): Promise<ContributionStatsCalculator> {
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
						.filter((contribution) => contribution.status == StatusKey.SUCCEEDED)
						.map((contribution) => {
							const created = (contribution.created as Timestamp).toDate();
							return {
								userId: userDoc.id,
								isInstitution: user.institution ?? false,
								country: user.location?.toUpperCase() ?? 'CH',
								amountChf: contribution.amount_chf,
								feesChf: contribution.fees_chf,
								source: contribution.source,
								currency: contribution.currency.toUpperCase() ?? 'CHF',
								firstDayInMonth: DateTime.fromObject({
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

	totalContributionsChf = () => {
		return this.contributions.sumBy((c) => c.amountChf);
	};

	totalContributionsChfByCurrency = () => {
		return this.totalContributionsChfBy('currency');
	};

	totalContributionsChfByIsInstitution = () => {
		return this.totalContributionsChfBy('isInstitution');
	};

	totalContributionsChfByCountry = () => {
		return this.totalContributionsChfBy('country');
	};

	totalContributionsChfBySource = () => {
		return this.totalContributionsChfBy('source');
	};

	totalContributionsChfByFirstDayInMonth = () => {
		return this.totalContributionsChfBy('firstDayInMonth');
	};

	totalContributionsChfBy = (attribute: string) => {
		return this.contributions
			.groupBy(attribute)
			.map((contributions, group) => ({
				[attribute]: group,
				amountChf: _.sumBy(contributions, (c) => c.amountChf),
			}))
			.value();
	};

	totalFeesChf = () => {
		return this.contributions.sumBy((c) => c.feesChf);
	};

	allStats = () => {
		return {
			totalContributionsChf: this.totalContributionsChf(),
			totalContributionsChfByCurrency: this.totalContributionsChfByCurrency(),
			totalContributionsChfByIsInstitution: this.totalContributionsChfByIsInstitution(),
			totalContributionsChfByCountry: this.totalContributionsChfByCountry(),
			totalContributionsChfBySource: this.totalContributionsChfBySource(),
			totalContributionsChfByFirstDayInMonth: this.totalContributionsChfByFirstDayInMonth(),
			totalFeesChf: this.totalFeesChf(),
		};
	};
}
