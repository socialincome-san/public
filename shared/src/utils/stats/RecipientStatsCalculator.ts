import _ from 'lodash';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { RECIPIENT_FIRESTORE_PATH, Recipient, RecipientProgramStatus, recipientNGOs } from '../../types/recipient';

export interface RecipientStats {
	totalRecipients: TotalRecipientsByStatus;
	totalRecipientsByOrganization: OrganisationRecipientsByStatus;
}

/**
 * Simplified version of Recipient, for easy computation of several contribution related stats
 */
type RecipientStatsEntry = {
	progr_status: RecipientProgramStatus;
	organisation: string;
};

export type TotalRecipientsByStatus = {
	total: number;
	active: number;
	former: number;
	suspended: number;
};

export type OrganisationRecipientsByStatus = {
	[orgId: string]: TotalRecipientsByStatus;
};

export class RecipientStatsCalculator {
	constructor(readonly recipients: _.Collection<RecipientStatsEntry>) {}

	/**
	 * Calls the firestore database to retrieve the payments and constructs the
	 * RecipientStatsCalculator with the flattened intermediate data structure.
	 */
	static async build(firestoreAdmin: FirestoreAdmin): Promise<RecipientStatsCalculator> {
		const completeRecipientsData = await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();
		const recipientStatsEntries = await Promise.all(
			completeRecipientsData.docs
				.filter((recipientData) => !recipientData.data().test_recipient)
				.map(async (recipientData) => {
					const organisationSnapshot = await recipientData.data().organisation?.get();
					return {
						progr_status: recipientData.data().progr_status,
						organisation: organisationSnapshot?.id,
					};
				}),
		);
		return new RecipientStatsCalculator(_(recipientStatsEntries));
	}

	totalRecipients = (): TotalRecipientsByStatus => {
		const recipientsGroupedByProgStatus = _.groupBy(this.recipients.toJSON(), (x) => x.progr_status);
		return {
			total: this.recipients.size(),
			active: recipientsGroupedByProgStatus['active']?.length,
			former: recipientsGroupedByProgStatus['former']?.length,
			suspended: recipientsGroupedByProgStatus['suspended']?.length,
		};
	};

	totalRecipientsByOrganization = () => {
		const orgRecipientsObject: any = {};
		recipientNGOs.forEach((orgId) => {
			const totalRecipients = this.recipients.filter((recipient) => recipient.organisation === orgId);
			const recipientsGroupedByProgStatus = _.groupBy(totalRecipients.toJSON(), (x) => x.progr_status);
			orgRecipientsObject[orgId] = {
				total: totalRecipients?.size(),
				active: recipientsGroupedByProgStatus['active']?.length,
				former: recipientsGroupedByProgStatus['former']?.length,
				suspended: recipientsGroupedByProgStatus['suspended']?.length,
			};
		});
		return orgRecipientsObject;
	};

	allStats = (): RecipientStats => ({
		totalRecipients: this.totalRecipients(),
		totalRecipientsByOrganization: this.totalRecipientsByOrganization(),
	});
}
