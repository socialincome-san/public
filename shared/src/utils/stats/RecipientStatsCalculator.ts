import _ from 'lodash';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { RECIPIENT_FIRESTORE_PATH, Recipient, RecipientProgramStatus } from '../../types/recipient';

export interface RecipientStats {
	totalRecipients: TotalRecipientsByStatus;
	totalRecipientsByOrganization: TotalRecipientsByStatus;
}

/**
 * Simplified version of Recipient, for easy computation of several contribution related stats
 */
type RecipientStatsEntry = {
	progr_status: RecipientProgramStatus;
	organisation: string;
	test_recipient: boolean;
};

export type TotalRecipientsByStatus = {
	total: number;
	active: number;
	former: number;
	suspended: number;
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
			completeRecipientsData.docs.map(async (recipientData) => {
				const organisationSnapshot = await recipientData.data().organisation?.get();
				return {
					progr_status: recipientData.data().progr_status,
					organisation: organisationSnapshot?.id,
					test_recipient: recipientData.data().test_recipient ?? false,
				};
			}),
		);
		return new RecipientStatsCalculator(_(recipientStatsEntries));
	}

	totalRecipients = (): TotalRecipientsByStatus => ({
		total: this.recipients.filter((recipient) => !recipient.test_recipient).size(),
		active: this.recipients
			.filter((recipient) => recipient.progr_status === RecipientProgramStatus.Active && !recipient.test_recipient)
			.size(),
		former: this.recipients
			.filter((recipient) => recipient.progr_status === RecipientProgramStatus.Former && !recipient.test_recipient)
			.size(),
		suspended: this.recipients
			.filter((recipient) => recipient.progr_status === RecipientProgramStatus.Suspended && !recipient.test_recipient)
			.size(),
	});

	totalRecipientsByOrganization = (orgId?: string): TotalRecipientsByStatus => {
		if (!orgId) {
			return {
				total: 0,
				active: 0,
				former: 0,
				suspended: 0,
			};
		}
		const totalRecipients = this.recipients.filter(
			(recipient) => recipient.organisation === orgId && !recipient.test_recipient,
		);
		const activeRecipients = totalRecipients.filter(
			(recipient) => recipient.progr_status === RecipientProgramStatus.Active,
		);
		const formerRecipients = totalRecipients.filter(
			(recipient) => recipient.progr_status === RecipientProgramStatus.Former,
		);
		const suspendedRecipients = totalRecipients.filter(
			(recipient) => recipient.progr_status === RecipientProgramStatus.Suspended,
		);
		return {
			total: totalRecipients.size(),
			active: activeRecipients.size(),
			former: formerRecipients.size(),
			suspended: suspendedRecipients.size(),
		};
	};

	allStats = (orgName?: string): RecipientStats => ({
		totalRecipients: this.totalRecipients(),
		totalRecipientsByOrganization: this.totalRecipientsByOrganization(orgName),
	});
}
