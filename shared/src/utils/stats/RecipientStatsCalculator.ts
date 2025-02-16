import _ from 'lodash';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Recipient, RECIPIENT_FIRESTORE_PATH, RecipientProgramStatus } from '../../types/recipient';

export interface RecipientStats {
	recipientsCountByStatus: TotalRecipientsByStatus;
	recipientsCountByOrganisationAndStatus: OrganisationRecipientsByStatus;
}

export type TotalRecipientsByStatus = {
	[status in RecipientProgramStatus]?: number;
} & { total: number };

export type OrganisationRecipientsByStatus = Partial<Record<string, TotalRecipientsByStatus>> & { total: number };

export class RecipientStatsCalculator {
	constructor(readonly recipients: _.Collection<Pick<Recipient, 'progr_status' | 'organisation'>>) {}

	/**
	 * Calls the firestore database to retrieve the payments and constructs the
	 * RecipientStatsCalculator with the flattened intermediate data structure.
	 */
	static async build(firestoreAdmin: FirestoreAdmin): Promise<RecipientStatsCalculator> {
		const completeRecipientsData = await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();
		const recipientStatsEntries = completeRecipientsData.docs
			.filter((recipientData) => !recipientData.get('test_recipient'))
			.map((recipientData) => ({
				progr_status: recipientData.get('progr_status'),
				organisation: recipientData.get('organisation').id,
			}));
		return new RecipientStatsCalculator(_(recipientStatsEntries));
	}

	recipientsCountByStatus = (): TotalRecipientsByStatus =>
		({
			total: this.recipients.size(),
			...this.recipients
				.groupBy('progr_status')
				.map((recipients, status) => ({ [status]: recipients.length }))
				.reduce((a, b) => ({ ...a, ...b }), {}),
		}) as TotalRecipientsByStatus;

	recipientsCountByOrganisationAndStatus = () =>
		this.recipients
			.groupBy('organisation')
			.map((recipients, organisation) => ({
				[organisation]: {
					total: recipients.length,
					..._(recipients)
						.groupBy('progr_status')
						.map((recipients, status) => ({ [status]: recipients.length }))
						.reduce((a, b) => ({ ...a, ...b }), {}),
				},
			}))
			.reduce((a, b) => ({ ...a, ...b }), {}) as OrganisationRecipientsByStatus;

	allStats = (): RecipientStats => ({
		recipientsCountByStatus: this.recipientsCountByStatus(),
		recipientsCountByOrganisationAndStatus: this.recipientsCountByOrganisationAndStatus(),
	});
}
